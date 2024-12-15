import gsap from "gsap";
import { stateManager } from "..";
import { SerialData, SerialPort } from "../../type";

declare global {
  interface Navigator {
    serial: {
      requestPort: () => Promise<SerialPort>;
    };
  }
}

export default class SerialManager {
  private static instance: SerialManager;
  private port: SerialPort | null = null;
  private reader: ReadableStreamDefaultReader<any> | null = null;
  private data: SerialData = { 1: 2, 2: 2 };
  private MIN_VALUE = 2;
  private MAX_VALUE = 400;

  private button: HTMLButtonElement | null = null;
  isConnected: boolean = false;

  private constructor() { }

  public static getInstance(): SerialManager {
    if (!SerialManager.instance) {
      SerialManager.instance = new SerialManager();
    }
    return SerialManager.instance;
  }

  init = () => {
    this.button = document.createElement("button");
    this.button.style.zIndex = "999";
    this.button.style.position = "absolute";
    this.button.style.top = "0px";
    this.button.style.right = "0px";
    this.button.innerText = "Serial Conenction"

    document.body.appendChild(this.button);

    this.button.onclick = () => {
      this.connect();
    };
  }

  async connect(): Promise<void> {
    try {
      // Request a port and open a connection
      this.port = await navigator.serial.requestPort();
      await this.port.open({ baudRate: 9600 });

      const decoder = new TextDecoderStream();
      this.port.readable.pipeTo(decoder.writable);
      const inputStream = decoder.readable;
      this.reader = inputStream.getReader();

      this.readSerial();
      this.isConnected = true;
    } catch (err) {
      console.log("connection failed", err);
      if (this.button) this.button.innerText = "failed";
    }
  }

  private readSerial = async (): Promise<void> => {
    if (!this.port || !this.reader) return;

    let buffer = "";
    while (true) {
      try {
        const { value, done } = await this.reader.read();
        if (done) {
          // Reader closed, exit loop
          break;
        }
        if (value) {
          buffer += value; // 새 데이터를 버퍼에 추가

          // 패킷 구분: 시작(<)과 끝(>) 문자로 구분
          const startIdx = buffer.indexOf("<");
          let endIdx = buffer.indexOf(">");

          if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
            const packet = buffer.substring(startIdx + 1, endIdx); // 패킷 추출
            buffer = buffer.substring(endIdx + 1); // 처리된 데이터 제거

            // 쉼표로 분리된 값 처리
            packet.split(",").forEach((val, idx) => {
              const newVal = Math.min(Math.max(parseInt(val), this.MIN_VALUE), this.MAX_VALUE);
              if (isNaN(newVal)) this.data[idx + 1] = 2;
              else {
                this.data[idx + 1] = (this.data[idx + 1] + newVal) / 2;
              }
            });

            // remove previous packet
            endIdx = buffer.indexOf(">");
            buffer = buffer.substring(endIdx + 1);
          }
          await new Promise((res) => setTimeout(() => res(1), 100));
        }
      } catch (err) {
        console.log("read error");
        break;
      }
    }
  }

  getData(): SerialData {
    const newData: SerialData = {};
    Object.values(this.data).forEach((val, idx) => {
      if (val < this.MIN_VALUE) newData[idx + 1] = 0;
      else if (val > this.MAX_VALUE) newData[idx + 1] = 1;
      else newData[idx + 1] = (val - this.MIN_VALUE) / (this.MAX_VALUE - this.MIN_VALUE);
    })

    if (stateManager.getLocal()) {
      // for dev
      // sensor1 => 2~50 => 0~1
      newData[1] = this.normalize(0, 10, Math.min(newData[1] * 100, 10));
      // sensor2 => 2~15 => 0~1
      newData[2] = this.normalize(0, 10, Math.min(newData[2] * 100, 10));

    } else {
      // real situation
      // sensor1 => 2~50 => 0~1
      newData[1] = this.normalize(0, 50, Math.min(newData[1] * 100, 50));
      // sensor2 => 2~15 => 0~1
      newData[2] = this.normalize(0, 15, Math.min(newData[2] * 100, 15));
    }

    if (this.button && this.isConnected) this.button.innerText = `sensor1: ${newData[1]}, sensor2: ${newData[2]}`
    return newData;
  }

  private normalize(min: number, max: number, val: number) {
    const newVal = (val - min) / (max - min);
    return parseFloat(newVal.toFixed(3));
  }

}
