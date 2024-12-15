import gsap from "gsap";
import { stateManager } from "..";

export default class MusicManager {
  private static instance: MusicManager;

  private music: HTMLAudioElement | null = null;

  private brain_url = "/music/background/0.mp3";
  private heart_url = "/music/heartbeat_intro.mp3";
  private heart_end_url = "/music/heartbeat_ending.mp3";
  private heart_beep_url = "/music/heartbeat_beep.mp3";


  private constructor() {
    this.music = document.getElementById("music") as HTMLAudioElement;
  }

  public static getInstance(): MusicManager {
    if (!MusicManager.instance) {
      MusicManager.instance = new MusicManager();
    }
    return MusicManager.instance;
  }

  heart = () => {
    this.playmusic(this.heart_url, true);
  }


  stop = () => {
    this.playmusic(this.heart_end_url, false, () => {
      stateManager.updateState("brain");
      stateManager.updateTransition(true);
    });
  }

  brain = () => {
    this.playmusic(this.heart_beep_url, false, () => {
      setTimeout(() => {
        this.playmusic(this.brain_url, true);
      }, 1500);
    })
  }

  brainBackground = () => {
    this.playmusic(this.brain_url, true);
  }

  background = () => {
    this.playmusic(`/music/background/${Math.floor(Math.random() * 5) + 1}.mp3`, true);
  }

  pausemusic = (endCallback?: () => void) => {
    gsap.to(this.music, {
      volume: 0,
      duration: 2,
      ease: "power1.inOut",
      onComplete: () => {
        if (this.music) {
          this.music.pause();
          this.music.volume = 1;
        }
        if (endCallback) endCallback();
      }
    })
  }

  playmusic = (url: string, loop: boolean, endCallback?: () => void) => {
    if (!this.music) return;

    this.music.src = url;
    this.music.loop = loop;

    this.music.load();

    this.music.addEventListener('canplaythrough', () => {
      if (this.music) this.music.play();
    });

    if (endCallback) {
      const endCallbackWrapper = () => {
        endCallback();
        if (this.music) this.music.removeEventListener('ended', endCallbackWrapper);
      }
      this.music.addEventListener('ended', endCallbackWrapper);
    }

  }
}
