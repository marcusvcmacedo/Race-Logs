const R = require("ramda");
const { once } = require("events");
const { createReadStream } = require("fs");
const { createInterface } = require("readline");

class Race {
  constructor() {
    this.speeds;
    this.raceResult;
    this.bestRaceLap;
    this.data = [];
    this.rank = [];
    this.bestPilotsLaps = [];
    this.timeFromWinner = [];
  }

  async readLog() {
    try {
      const readLine = createInterface({
        input: createReadStream("log.txt") //arquivo de log da corrida
      });

      readLine.on("line", line => {
        const formatLine = line.replace(/\s\s+/g, "|"); // remove espaços em branco entre os dados
        const lineData = formatLine.split("|"); // organiza os resultados individualmente

        this.data.push(lineData); //adiciona dados da linha na lista de dados
      });

      await once(readLine, "close");
      await this.formatResult(this.data); //envia todas linhas lidas para formatação
    } catch (err) {
      console.error(err);
    }
  }

  formatResult(data) {
    data.shift(); //remove cabeçalho (Hora, Piloto, ...)

    const racePartials = data.map(line => {
      //cria lista com dados parciais do log, para serem ordenados e agrupados
      return {
        hora: line[0],
        piloto: line[1],
        numVolta: line[2],
        tempoVolta: line[3],
        velMedia: line[4]
      };
    });

    //ordena o resultado pelo piloto que fez mais voltas em menos tempo
    const raceSorted = R.sortWith([
      R.descend(R.prop("numVolta")),
      R.ascend(R.prop("hora"))
    ])(racePartials);

    //agrupa resultado por piloto
    this.raceResult = R.groupBy(race => race.piloto)(raceSorted);
  }

  getPositionData(pilotData, count) {
    return {
      position: `${count}º Lugar`,
      code: pilotData[0].piloto.split(" ")[0], // "Código(0)" "-(1)" "NomeDoPiloto(2)"
      name: pilotData[0].piloto.split(" ")[2], // "Código(0)" "-(1)" "NomeDoPiloto(2)"
      laps: pilotData[0].numVolta
    };
  }

  sumLapTimes(pilotData) {
    return R.reduceBy(
      (acc, { tempoVolta }) => acc + parseFloat(tempoVolta.replace(":", ".")),
      0,
      x => x.piloto,
      pilotData
    );
  }

  sumVelocity(pilotData) {
    return R.reduceBy(
      (acc, { velMedia }) => acc + parseFloat(velMedia),
      0,
      x => x.piloto,
      pilotData
    );
  }

  calculateTimeFromWinner(totalTime, rank, pilotData) {
    //rank[0] = vencedor da corrida, primeiro piloto da lista
    const time = (totalTime - parseFloat(rank[0].totalTime)).toFixed(2); //limita em duas casas

    return {
      pilot: pilotData[0].piloto,
      timeFromWinner: time
    };
  }

  calculateSpeed(sumVelocity, pilotData) {
    const speed = (
      Object.values(sumVelocity)[0] / parseFloat(pilotData[0].numVolta)
    ).toFixed(2);

    return {
      pilot: pilotData[0].piloto,
      speed
    };
  }

  getBestPilotLap(pilotData) {
    return R.sortWith([R.ascend(R.prop("tempoVolta"))])(pilotData)[0];
  }

  fetchRaceData(data) {
    let rank = [];
    let speeds = [];
    let bestPilotsLaps = [];

    let count = 0; //contador de pilotos

    for (const result in data) {
      const pilotData = data[result];
      count++;

      const position = this.getPositionData(pilotData, count);
      const sumSpeed = this.sumVelocity(pilotData);
      const sumLapTimes = this.sumLapTimes(pilotData);
      const totalTime = Object.values(sumLapTimes)[0]; //soma dos tempos de todas as voltas do piloto

      if (!R.isEmpty(rank)) {
        //se o piloto atual não é o vencedor, pega o tempo que piloto atual chegou após o vencedor
        const timeFromWinner = this.calculateTimeFromWinner(
          totalTime,
          rank,
          pilotData,
          count
        );

        this.timeFromWinner.push(timeFromWinner); //adiciona tempo que o piloto chegou após o vencedor
      }

      const speed = this.calculateSpeed(sumSpeed, pilotData);

      const bestPilotLap = this.getBestPilotLap(pilotData); //ordena lista por tempo de volta

      /* adiciona aos resultados a posição do piloto, 
      junto com os demais dados do mesmo e o tempo total que ele levou na corrida */
      rank.push({ ...position, totalTime: totalTime.toFixed(2) }); //limite 2 em casas

      speeds.push(speed); //adiciona velocidades médias
      bestPilotsLaps.push(bestPilotLap); //adiciona melhores voltas dos pilotos
    }

    this.rank = rank;
    this.speeds = speeds;
    this.bestPilotsLaps = bestPilotsLaps;
    this.bestRaceLap = this.bestPilotsLaps[0]; // pega primeiro piloto da lista de melhores voltas (piloto com melhor volta)
  }

  async result() {
    await this.readLog();
    this.fetchRaceData(this.raceResult);

    console.log("_________________RACE RESULT_________________");
    console.log(this.rank);

    console.log("_________________BEST LAPS_________________");
    console.log(this.bestPilotsLaps);

    console.log("_________________BEST RACE`S LAP_________________");
    console.log(this.bestRaceLap);

    console.log("_________________PILOT`S SPEEDS_________________");
    console.log(this.speeds);

    console.log("_________________TIME FROM THE WINNER_________________");
    console.log(this.timeFromWinner);
  }
}

module.exports = new Race();
