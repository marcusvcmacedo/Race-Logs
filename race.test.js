const Race = require("./race");

describe("Race Test", () => {
  it("Should get pilot position", () => {
    const pilotData = [
      {
        piloto: "10 - Piloto",
        numVolta: 5
      }
    ];

    const response = Race.getPositionData(pilotData, 1);

    expect(response).toBeDefined();
    expect(response).toEqual({
      position: "1º Lugar",
      code: "10",
      name: "Piloto",
      laps: 5
    });
  });

  it("Should sum lap times", () => {
    const pilotData = [
      {
        piloto: "10 - Piloto",
        numVolta: 5,
        tempoVolta: "1:30.100"
      },
      {
        piloto: "10 - Piloto",
        numVolta: 5,
        tempoVolta: "1:40.200"
      }
    ];

    const response = Race.sumLapTimes(pilotData);

    expect(response).toBeDefined();
    expect(Object.values(response)[0]).toBe(2.7);
  });

  it("Should sum speed", () => {
    const pilotData = [
      {
        piloto: "10 - Piloto",
        numVolta: 5,
        velMedia: "20.00"
      },
      {
        piloto: "10 - Piloto",
        numVolta: 5,
        velMedia: "10.20"
      }
    ];

    const response = Race.sumVelocity(pilotData);

    expect(response).toBeDefined();
    expect(Object.values(response)[0]).toBe(30.2);
  });

  it("Should calculate time from the winner", () => {
    const rank = [
      {
        totalTime: "4.20"
      }
    ];

    const totalTime = 5.1;

    const pilotData = [
      {
        piloto: "10 - Piloto"
      }
    ];

    const response = Race.calculateTimeFromWinner(totalTime, rank, pilotData);

    expect(response).toBeDefined();
    expect(response).toEqual({
      pilot: "10 - Piloto",
      timeFromWinner: "0.90"
    });
  });

  it("Should calculate speed", () => {
    const sumVelocity = { velocity: 200.1 };

    const pilotData = [
      {
        piloto: "10 - Piloto",
        numVolta: 5
      }
    ];

    const response = Race.calculateSpeed(sumVelocity, pilotData);

    expect(response).toBeDefined();
    expect(response).toEqual({
      pilot: "10 - Piloto",
      speed: "40.02"
    });
  });

  it("Should get best lap", () => {
    const pilotData = [
      {
        piloto: "20 - Piloto",
        tempoVolta: "1:200.10"
      },
      {
        piloto: "10 - Piloto",
        tempoVolta: "1:100.10"
      },
      {
        piloto: "30 - Piloto",
        tempoVolta: "2:100.10"
      }
    ];

    const response = Race.getBestPilotLap(pilotData);

    expect(response).toBeDefined();
    expect(response).toEqual({
      piloto: "10 - Piloto",
      tempoVolta: "1:100.10"
    });
  });
});
