import notifee, { TriggerType, AndroidImportance, AndroidVisibility, AndroidCategory, RepeatFrequency } from '@notifee/react-native';

// ... setupAlarmChannel remains the same

export async function scheduleMedicationAlarm(medication, timeString) {
  const channelId = await setupAlarmChannel();
  
  const [hours, minutes] = timeString.split(':');
  const date = new Date();
  date.setHours(parseInt(hours, 10));
  date.setMinutes(parseInt(minutes, 10));
  date.setSeconds(0);

  if (date.getTime() < Date.now()) {
    date.setDate(date.getDate() + 1);
  }

  // UPDATED: Now repeats daily automatically!
  const trigger = {
    type: TriggerType.TIMESTAMP,
    timestamp: date.getTime(),
    repeatFrequency: RepeatFrequency.DAILY, 
    alarmManager: true,
  };

  await notifee.createTriggerNotification(
    {
      id: `${medication.id}-${timeString}`,
      title: `💊 Time to take ${medication.name}`,
      body: medication.strength ? `${medication.strength} ${medication.form}` : `It's time for your ${medication.form}`,
      android: {
        channelId,
        category: AndroidCategory.ALARM,
        fullScreenAction: { id: 'default' },
        actions: [
          { title: '✅ Take Now', pressAction: { id: 'take' } },
          { title: '⏰ Snooze', pressAction: { id: 'snooze' } },
        ],
      },
    },
    trigger
  );
}
