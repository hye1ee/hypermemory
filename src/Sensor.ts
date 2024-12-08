// const SENSOR_NAME_1 = "sensor1";
// const SENSOR_NAME_2 = "sensor2";
// const SENSOR_NAME_3 = "sensor3";

// interface ArduinoData {
//   [key: string]: number;
// }

// class Sensor {
//   static instance: Sensor | null = null;
//   dev: boolean = true;
//   sliders: { [key: string]: HTMLInputElement };
//   arduinoData: ArduinoData;

//   constructor() {
//     if (Sensor.instance) {
//       return Sensor.instance;
//     }

//     Sensor.instance = this;

//     this.dev = true; // true: 개발 모드 (슬라이더 사용), false: 아두이노 연결
//     this.sliders = {}; // 슬라이더 DOM 요소 저장
//     this.arduinoData = {
//       [SENSOR_NAME_1]: 0,
//       [SENSOR_NAME_2]: 0,
//       [SENSOR_NAME_3]: 1,
//     }; // 아두이노에서 수신된 값

//     if (this.dev) {
//       this.setupSliders(); // 개발 모드일 때 슬라이더 설정
//     } else {
//       this.connectToArduino(); // 아두이노 연결
//     }
//   }

//   // 슬라이더 생성 및 관리
//   setupSliders(): void {
//     const container = document.createElement("div");
//     container.id = "sliders";
//     container.style.position = "absolute";
//     container.style.top = "10px";
//     container.style.right = "10px";
//     container.style.zIndex = "10";
//     container.style.background = "rgba(255, 255, 255, 0.8)";
//     container.style.padding = "10px";
//     container.style.borderRadius = "8px";
//     container.style.display = "flex";
//     container.style.flexDirection = "column";
//     container.style.gap = "10px";

//     document.body.appendChild(container);

//     // 슬라이더 생성
//     [SENSOR_NAME_1, SENSOR_NAME_2, SENSOR_NAME_3].forEach((axis) => {
//       const label = document.createElement("label");
//       label.textContent = `${axis.toUpperCase()}:`;

//       const input = document.createElement("input");
//       input.type = "range";
//       input.id = `slider-${axis}`;
//       input.min = "-5";
//       input.max = "5";
//       input.step = "0.1";
//       input.value = "0";

//       label.appendChild(input);
//       container.appendChild(label);

//       this.sliders[axis] = input;
//     });
//   }

//   // 아두이노 연결
//   async connectToArduino(): Promise<void> {
//     try {
//       const port = await navigator.serial.requestPort();
//       await port.open({ baudRate: 9600 });
//       const reader = port.readable!.getReader();

//       // 데이터 읽기 루프
//       while (true) {
//         const { value, done } = await reader.read();
//         if (done) break;

//         const text = new TextDecoder().decode(value);
//         const [sensor1, sensor2, sensor3] = text.split(",").map(Number);
//         this.arduinoData[SENSOR_NAME_1] = sensor1 || 0;
//         this.arduinoData[SENSOR_NAME_2] = sensor2 || 0;
//         this.arduinoData[SENSOR_NAME_3] = sensor3 || 1;
//       }
//     } catch (error) {
//       console.error("Error connecting to Arduino:", error);
//     }
//   }

//   // 현재 값 가져오기
//   getValue(): number[] {
//     if (this.dev) {
//       return Object.values(this.sliders).map((slider) =>
//         parseFloat(slider.value)
//       ); // 슬라이더 값 반환
//     } else {
//       return Object.values(this.arduinoData); // 아두이노 데이터 반환
//     }
//   }
// }

// // 싱글톤 인스턴스 생성
// const sensor = new Sensor();
// export default sensor;
