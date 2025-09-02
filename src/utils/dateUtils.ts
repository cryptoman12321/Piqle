/**
 * Date utility functions for consistent date handling across the app
 */

/**
 * Get the start of a day (00:00:00.000)
 */
export const getDayStart = (date: Date | string): Date => {
  const dateObj = new Date(date);
  const dayStart = new Date(dateObj);
  dayStart.setHours(0, 0, 0, 0);
  return dayStart;
};

/**
 * Get the end of a day (23:59:59.999)
 */
export const getDayEnd = (date: Date | string): Date => {
  const dateObj = new Date(date);
  const dayEnd = new Date(dateObj);
  dayEnd.setHours(23, 59, 59, 999);
  return dayEnd;
};

/**
 * Check if a date falls within a specific day
 */
export const isDateInDay = (dateToCheck: Date | string, dayDate: Date | string): boolean => {
  const checkDate = new Date(dateToCheck);
  const dayStart = getDayStart(dayDate);
  const dayEnd = getDayEnd(dayDate);
  
  return checkDate >= dayStart && checkDate <= dayEnd;
};

/**
 * Get date string in YYYY-MM-DD format
 */
export const getDateString = (date: Date | string): string => {
  const dateObj = new Date(date);
  return dateObj.toISOString().split('T')[0];
};

/**
 * Get date string in YYYY-MM-DD format for a specific day
 * This function preserves the original date without timezone shifts
 */
export const getDayDateString = (date: Date | string): string => {
  const dateObj = new Date(date);
  // Use the original date's year, month, and day to avoid timezone issues
  return dateObj.toISOString().split('T')[0];
};

/**
 * Get week days starting from today
 */
export const getWeekDays = (daysCount: number = 7) => {
  const today = new Date();
  const weekDays = [];
  
  for (let i = 0; i < daysCount; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    
    weekDays.push({
      date: getDayDateString(date),
      shortName: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()],
      dayNumber: date.getDate(),
      isToday: i === 0,
    });
  }
  
  return weekDays;
};

/**
 * Get week days starting from today in LOCAL timezone (not UTC)
 */
export const getLocalWeekDays = (daysCount: number = 7) => {
  const today = new Date();
  const weekDays = [];
  
  for (let i = 0; i < daysCount; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    
    // Use local date string instead of UTC
    const localDateString = date.toLocaleDateString('en-CA'); // YYYY-MM-DD format
    
    weekDays.push({
      date: localDateString,
      shortName: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()],
      dayNumber: date.getDate(),
      isToday: i === 0,
    });
  }
  
  return weekDays;
};

/**
 * Format time for display (HH:MM)
 */
export const formatTime = (date: Date | string): string => {
  const dateObj = new Date(date);
  return dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

/**
 * Format date for display (MM/DD/YYYY)
 */
export const formatDate = (date: Date | string): string => {
  const dateObj = new Date(date);
  return dateObj.toLocaleDateString();
};

/**
 * Check if a date is today
 */
export const isToday = (date: Date | string): boolean => {
  const dateObj = new Date(date);
  const today = new Date();
  return getDateString(dateObj) === getDateString(today);
};

/**
 * Check if a date is in the future
 */
export const isFutureDate = (date: Date | string): boolean => {
  const dateObj = new Date(date);
  const now = new Date();
  return dateObj > now;
};

/**
 * Check if a date is in the past
 */
export const isPastDate = (date: Date | string): boolean => {
  const dateObj = new Date(date);
  const now = new Date();
  return dateObj < now;
};
