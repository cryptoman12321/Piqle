# 🚀 PIQLE Sharing Feature

## Overview
PIQLE теперь поддерживает полноценный шеринг с диплинками и красивым отображением в социальных сетях!

## ✨ Features

### 🔗 Deep Links
- **Games**: `piqle://game/{id}` - открывает игру в приложении
- **Tournaments**: `piqle://tournament/{id}` - открывает турнир в приложении  
- **Profiles**: `piqle://profile/{id}` - открывает профиль в приложении
- **Matches**: `piqle://match/{id}` - открывает результаты матча в приложении

### 📱 Social Media Integration
- **Telegram** - красивое превью с градиентом
- **WhatsApp** - структурированное сообщение
- **Facebook** - rich preview с метаданными
- **Twitter** - оптимизированный твит
- **Instagram** - копирование в буфер обмена

### 🎨 Beautiful Previews
- Градиентные заголовки для каждого типа контента
- Метаданные (игроки, формат, локация, дата, статус)
- Брендинг PIQLE с логотипом
- Адаптивный дизайн для разных размеров экранов

## 🛠 Technical Implementation

### Components
- **ShareModal** - основной модал для шеринга
- **SharePreview** - превью контента для соцсетей
- **useDeepLinking** - хук для обработки диплинков

### Dependencies
```bash
npm install expo-sharing expo-linking react-native-share
```

### Configuration
В `app.json` добавлен scheme для диплинков:
```json
{
  "expo": {
    "scheme": "piqle"
  }
}
```

## 📖 Usage

### Basic Sharing
```tsx
import ShareModal from '../components/ShareModal';

const [showShareModal, setShowShareModal] = useState(false);

// В JSX
<ShareModal
  visible={showShareModal}
  onClose={() => setShowShareModal(false)}
  shareData={{
    type: 'game',
    id: game.id,
    title: game.title,
    description: game.description,
  }}
/>
```

### Deep Link Handling
```tsx
import { useDeepLinking } from '../hooks/useDeepLinking';

const MyComponent = () => {
  useDeepLinking(); // Автоматически обрабатывает диплинки
  // ...
};
```

## 🎯 Supported Content Types

### Games
- Заголовок и описание
- Количество игроков
- Формат игры (1v1, 2v2, Open Play)
- Локация
- Дата и время
- Статус (Upcoming, In Progress, Completed)

### Tournaments
- Название и описание
- Формат турнира
- Количество участников
- Даты проведения
- Статус регистрации

### Profiles
- Имя пользователя
- Рейтинг
- Статистика игр
- Достижения

### Matches
- Результаты матча
- Команды и игроки
- Счет по геймам
- Время завершения

## 🌟 Benefits

1. **User Experience** - красивый шеринг вместо простых ссылок
2. **App Discovery** - диплинки приводят новых пользователей в приложение
3. **Social Engagement** - привлекательный контент для соцсетей
4. **Brand Recognition** - узнаваемый брендинг PIQLE
5. **Deep Integration** - прямая навигация к контенту в приложении

## 🔧 Customization

### Colors
Каждый тип контента имеет свои цвета:
- **Games**: Primary → Secondary градиент
- **Tournaments**: Gold → Orange градиент
- **Profiles**: Info → Primary градиент
- **Matches**: Green → Light Green градиент

### Metadata
Можно настроить отображаемые метаданные для каждого типа контента.

### Icons
Используются Ionicons для каждого типа:
- Games: `game-controller`
- Tournaments: `trophy`
- Profiles: `person`
- Matches: `medal`

## 🚀 Future Enhancements

- [ ] Поддержка изображений в превью
- [ ] Аналитика шеринга
- [ ] A/B тестирование разных превью
- [ ] Интеграция с другими платформами
- [ ] Кастомные шаблоны для разных типов контента

