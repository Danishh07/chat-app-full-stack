export const playNotificationSound = () => {
  const audio = new Audio('/notification.mp3');
  audio.volume = 0.5;
  audio.play().catch(() => {
    // avoid error if user hasn't interacted with page yet
    console.warn("Autoplay blocked or error playing sound");
  });
};
