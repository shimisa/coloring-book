// Audio utility functions with error handling
export const playAudioSafely = (audioPath: string, volume: number = 0.3): void => {
  try {
    const audio = new Audio(audioPath);
    audio.volume = volume;
    audio.load();
    audio.play().catch((error) => {
      console.warn('Could not play audio:', audioPath, error);
    });
  } catch (error) {
    console.warn('Could not create audio:', audioPath, error);
  }
};

export const createAudioSafely = (audioPath: string): HTMLAudioElement | null => {
  try {
    const audio = new Audio(audioPath);
    audio.load();
    return audio;
  } catch (error) {
    console.warn('Could not create audio:', audioPath, error);
    return null;
  }
};
