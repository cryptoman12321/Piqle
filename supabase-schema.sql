-- Создание таблиц для системы управления турнирами Piqle

-- 1. Таблица пользователей
CREATE TABLE users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Таблица турниров
CREATE TABLE tournaments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    max_participants INTEGER NOT NULL CHECK (max_participants > 0),
    status VARCHAR(20) DEFAULT 'REGISTRATION_OPEN' CHECK (status IN ('REGISTRATION_OPEN', 'IN_PROGRESS', 'COMPLETED')),
    creator_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    tournament_type VARCHAR(30) DEFAULT 'SINGLES_ROUND_ROBIN' CHECK (tournament_type IN ('SINGLES_ROUND_ROBIN', 'DOUBLES', 'ELIMINATION'))
);

-- 3. Таблица участников турнира
CREATE TABLE tournament_players (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    position INTEGER NOT NULL,
    is_waiting_list BOOLEAN DEFAULT FALSE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(tournament_id, user_id)
);

-- 4. Таблица матчей
CREATE TABLE matches (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE,
    player1_id UUID REFERENCES users(id) ON DELETE CASCADE,
    player2_id UUID REFERENCES users(id) ON DELETE CASCADE,
    round INTEGER NOT NULL,
    match_number INTEGER NOT NULL,
    score1 INTEGER DEFAULT 0,
    score2 INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'IN_PROGRESS', 'COMPLETED')),
    winner_id UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(tournament_id, round, match_number)
);

-- Создание индексов для улучшения производительности
CREATE INDEX idx_tournaments_creator ON tournaments(creator_id);
CREATE INDEX idx_tournaments_status ON tournaments(status);
CREATE INDEX idx_tournament_players_tournament ON tournament_players(tournament_id);
CREATE INDEX idx_tournament_players_user ON tournament_players(user_id);
CREATE INDEX idx_matches_tournament ON matches(tournament_id);
CREATE INDEX idx_matches_players ON matches(player1_id, player2_id);
CREATE INDEX idx_matches_round ON matches(tournament_id, round);

-- Создание триггеров для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_tournaments_updated_at BEFORE UPDATE ON tournaments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_matches_updated_at BEFORE UPDATE ON matches
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Настройка Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournament_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

-- Политики безопасности для users
CREATE POLICY "Users can view all users" ON users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON users FOR INSERT WITH CHECK (auth.uid() = id);

-- Политики безопасности для tournaments
CREATE POLICY "Anyone can view tournaments" ON tournaments FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create tournaments" ON tournaments FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Tournament creators can update tournaments" ON tournaments FOR UPDATE USING (auth.uid() = creator_id);
CREATE POLICY "Tournament creators can delete tournaments" ON tournaments FOR DELETE USING (auth.uid() = creator_id);

-- Политики безопасности для tournament_players
CREATE POLICY "Anyone can view tournament players" ON tournament_players FOR SELECT USING (true);
CREATE POLICY "Authenticated users can join tournaments" ON tournament_players FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Tournament creators can manage players" ON tournament_players FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM tournaments 
        WHERE tournaments.id = tournament_players.tournament_id 
        AND tournaments.creator_id = auth.uid()
    )
);
CREATE POLICY "Tournament creators can remove players" ON tournament_players FOR DELETE USING (
    EXISTS (
        SELECT 1 FROM tournaments 
        WHERE tournaments.id = tournament_players.tournament_id 
        AND tournaments.creator_id = auth.uid()
    )
);

-- Политики безопасности для matches
CREATE POLICY "Anyone can view matches" ON matches FOR SELECT USING (true);
CREATE POLICY "Tournament creators can create matches" ON matches FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM tournaments 
        WHERE tournaments.id = matches.tournament_id 
        AND tournaments.creator_id = auth.uid()
    )
);
CREATE POLICY "Tournament creators can update matches" ON matches FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM tournaments 
        WHERE tournaments.id = matches.tournament_id 
        AND tournaments.creator_id = auth.uid()
    )
);

-- Создание представления для турнирной таблицы
CREATE VIEW tournament_standings AS
SELECT 
    t.id as tournament_id,
    t.name as tournament_name,
    u.id as user_id,
    u.first_name,
    u.last_name,
    tp.position,
    tp.is_waiting_list,
    COUNT(m.id) as total_matches,
    COUNT(CASE WHEN m.winner_id = u.id THEN 1 END) as matches_won,
    COUNT(CASE WHEN m.winner_id != u.id AND m.winner_id IS NOT NULL THEN 1 END) as matches_lost,
    COALESCE(SUM(CASE WHEN m.player1_id = u.id THEN m.score1 ELSE m.score2 END), 0) as points_won,
    COALESCE(SUM(CASE WHEN m.player1_id = u.id THEN m.score2 ELSE m.score1 END), 0) as points_lost
FROM tournaments t
JOIN tournament_players tp ON t.id = tp.tournament_id
JOIN users u ON tp.user_id = u.id
LEFT JOIN matches m ON (t.id = m.tournament_id AND (m.player1_id = u.id OR m.player2_id = u.id))
GROUP BY t.id, t.name, u.id, u.first_name, u.last_name, tp.position, tp.is_waiting_list
ORDER BY t.id, tp.is_waiting_list, tp.position;

-- Создание функции для генерации матчей round-robin
CREATE OR REPLACE FUNCTION generate_round_robin_matches(tournament_uuid UUID)
RETURNS VOID AS $$
DECLARE
    player_count INTEGER;
    rounds INTEGER;
    matches_per_round INTEGER;
    round_num INTEGER;
    match_num INTEGER;
    player1_pos INTEGER;
    player2_pos INTEGER;
BEGIN
    -- Получаем количество игроков
    SELECT COUNT(*) INTO player_count
    FROM tournament_players 
    WHERE tournament_id = tournament_uuid AND is_waiting_list = FALSE;
    
    IF player_count < 2 THEN
        RAISE EXCEPTION 'Need at least 2 players to generate matches';
    END IF;
    
    -- Количество раундов для round-robin
    IF player_count % 2 = 0 THEN
        rounds := player_count - 1;
    ELSE
        rounds := player_count;
    END IF;
    
    matches_per_round := player_count / 2;
    
    -- Генерируем матчи для каждого раунда
    FOR round_num IN 1..rounds LOOP
        FOR match_num IN 1..matches_per_round LOOP
            -- Простая логика генерации матчей (можно улучшить)
            player1_pos := ((round_num - 1 + match_num - 1) % (player_count - 1)) + 1;
            player2_pos := player_count - ((round_num - 1 + match_num - 1) % (player_count - 1));
            
            IF player2_pos = player_count THEN
                player2_pos := player_count;
            END IF;
            
            -- Вставляем матч
            INSERT INTO matches (tournament_id, player1_id, player2_id, round, match_number)
            SELECT 
                tournament_uuid,
                tp1.user_id,
                tp2.user_id,
                round_num,
                match_num
            FROM tournament_players tp1
            JOIN tournament_players tp2 ON tp2.tournament_id = tp1.tournament_id
            WHERE tp1.tournament_id = tournament_uuid 
                AND tp1.position = player1_pos 
                AND tp2.position = player2_pos
                AND tp1.is_waiting_list = FALSE 
                AND tp2.is_waiting_list = FALSE;
        END LOOP;
    END LOOP;
END;
$$ LANGUAGE plpgsql;
