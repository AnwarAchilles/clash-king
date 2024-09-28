Nirvana.environment({
  configure: {},
  provider: {},
  service: {},
});


const BASEURL = "https://clashking.anwarachilles.my.id/";


Nirvana.provider(
  "LocalStorage", class {
    static async set(key, value) {
      try {
        const serializedValue = JSON.stringify(value);
        localStorage.setItem(key, serializedValue);
        return true;
      } catch (error) {
        console.error("Error saving to localStorage:", error);
        return false;
      }
    }
    static async get(key) {
      try {
        const value = localStorage.getItem(key);
        return value ? JSON.parse(value) : null;
      } catch (error) {
        console.error("Error getting from localStorage:", error);
        return null;
      }
    }
    static async has(key) {
      return localStorage.getItem(key) !== null;
    }
    static async remove(key) {
      try {
        localStorage.removeItem(key);
        return true;
      } catch (error) {
        console.error("Error removing from localStorage:", error);
        return false;
      }
    }
  }
);
Nirvana.provider(
  "Router", class {
    static baseurl = BASEURL;
    static setup( routesAndComponents ) {
      Object.entries(routesAndComponents).forEach(([url, component]) => {
        this.on( url, component );
      });
      this.start();
      if (window.performance.navigation.type === window.performance.navigation.TYPE_RELOAD) {
        window.location.assign(Nirvana.Router.baseurl);
      }
    }
    static start() {
      Nirvana.store("Router").forEach((core, url) => {
        // Ambil bagian setelah # dan sebelum tanda ?
        let actualUrl = (window.location.href.split("#")[1] || "").split("?")[0];
        if (actualUrl == url) {
          let routerElement = select(`[nirvana-router=${core.prefix}]`).item(0);
          // Clear the innerHTML
          routerElement.innerHTML = "";
          // Append core component's router
          routerElement.append(core.component.router);
          // Start the core component
          core.component.start();
          // Display the router
          core.component.router.style.display = "block";
        }
      });
    }
    static on( targetUrl, core ) {
      core.component.router = core.component.element;
      core.component.element.remove();
      Nirvana.store("Router").set(targetUrl, core);
    }
    static redirect( url ) {
      window.history.replaceState({}, document.title, Nirvana.Router.baseurl + "#" + url);
      Nirvana.Router.start();
      Nirvana.LocalStorage.set("last-router", url);
    }
    static in( url ) {
      return (window.location.href.split("#")[1] || "") == url;
    }
  }
);






Nirvana.component(
  class Sound {
    store = Nirvana.store("Sound");
    async background(name) {
      this.store.get(`background-${name}`)?.pause();
      let target = select(`#sound-background-${name}`).item(0);
      this.backgroundEffect(target);
      target.play();
      this.store.set(`background-${name}`, target);
    }
    async backgroundStop(name) {
      this.store.get(`background-${name}`)?.pause();
    }
    async backgroundEffect(audio) {
      audio.volume = 0; // Mulai dari 0
      audio.loop = true; // Set untuk loop
      audio.play();
      let fadeAudio = setInterval(function() {
        if (audio.volume < 0.2) {
          audio.volume += 0.01; // Naikkan volume secara bertahap
        } else {
          clearInterval(fadeAudio); // Hentikan jika mencapai volume 0.6
        }
      }, 100); // Volume naik setiap 100ms
    }
    async voice(index, random) {
      this.store.get("voice")?.pause();
      let target = select(`#sound-voice-${index}-${random}`).item(0);
      target.play();
      this.store.set("voice", target);
    }
    async voiceStop() {
      this.store.get("voice")?.pause();
    }
    async encourage() {
      this.store.get("encourage")?.pause();
      let target = select(`#sound-encourage`).item(0);
      target.play();
      this.store.set("encourage", target);
    }
    async effect(name) {
      this.store.get(name)?.pause();
      let target = select(`#sound-${name}`).item(0);
      target.play();
      this.store.set(name, target);
    }
    async effectStop(name) {
      this.store.get(name)?.pause();
    }
  }
);



Nirvana.component(
  class Loading extends Nirvana {
    store = Nirvana.store("Loading");
    async start() {
      this.store.set("progress", 0);
      let interval = setInterval(() => {
        this.store.set("progress", this.store.get("progress") + Math.floor(Math.random() * 10) + 1);
        if (this.store.get("progress") > 100) {
          this.store.set("progress", 0);
          clearInterval(interval);
          Nirvana.Router.redirect("register");
        }else {
          this.setProgress( this.store.get("progress") );
        }
      }, 1000);
    }
    async setProgress( progress ) {
      select("#loading-bar>span").item(0).style.width = `${progress}%`;
      select("#loading-percentage").item(0).innerHTML = `${progress}%`;
    }
  }
);

Nirvana.component(
  class Register extends Nirvana {
    async start() {
      select("#background").item(0).style.opacity = 0.4;
      // Dialog component
      // opening
      document.querySelectorAll("[dialog-open]").forEach(button => {
        button.addEventListener("click", e => {
          let id = e.target.getAttribute("dialog-open");
          document.querySelector(`[dialog][id=${id}]`).setAttribute("show", 1);
        });
      });
      // closing
      document.querySelectorAll("[dialog-close]").forEach(button => {
        button.addEventListener("click", e => {
          let id = e.target.getAttribute("dialog-close");
          document.querySelector(`[dialog][id=${id}]`).removeAttribute("show");
        });
      });
    }
    async submit(event) {
      let input = select("#register-username").item(0).value;
      Nirvana.store("Player").set("serial", Date.now().toString(36) + Math.random().toString(36).substr(2, 9));
      Nirvana.store("Player").set("name", input);
      Nirvana.run("Sound").background("menu");
      Nirvana.run("Sound").effect("coin");
      Nirvana.Router.redirect("hero");
      this.openFullscreen();
      event.preventDefault();
    }
    async openFullscreen() {
      let elem = document.documentElement; // Mengambil elemen HTML utama
      if (elem.requestFullscreen) {
        elem.requestFullscreen();
      } else if (elem.mozRequestFullScreen) { // Untuk Firefox
        elem.mozRequestFullScreen();
      } else if (elem.webkitRequestFullscreen) { // Untuk Chrome, Safari, dan Opera
        elem.webkitRequestFullscreen();
      } else if (elem.msRequestFullscreen) { // Untuk Internet Explorer/Edge
        elem.msRequestFullscreen();
      }
    }
  }
);

Nirvana.component(
  class Hero extends Nirvana {
    store = Nirvana.store("Hero");
    async start() {
      select("#background").item(0).style.opacity = 0.2;
      // await this.chart();
      await this.load();
    }
    async load() {
      if (!this.store.has("data")) {
        let proms = await fetch("./char.json");
        let response = await proms.json();
        this.store.set("data", response);
      }
    }
    async chart(index) {
      if (this.store.has("chart")) {
        this.store.get("chart").destroy();
      }
      const data = {
        labels: [
          'Multiply',
          'Displacement',
          'Velocity',
          'versatile',
          'Damage',
        ],
        datasets: [
          {
            // label: 'Hero',
            data: this.store.get("data")[index].state,
            fill: true,
            backgroundColor: 'rgba(0, 0, 0, 0.2)',
            borderColor: 'rgba(0, 0, 0, 0.8)',
            pointBackgroundColor: 'rgba(0, 0, 0, 1)',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: 'rgba(0, 0, 0, 1)'
          }
        ]
      };
      const config = {
        type: 'radar',
        data: data,
        options: {
          elements: {
            line: {
              borderWidth: 1,
            },
          },
          plugins: {
            legend: {
              display: false, // Menghilangkan legend
            },
          },
          scales: {
            r: {
              ticks: {
                pointLabels: {
                  color: 'red'
                },
                display: false, // Menghilangkan angka pada sumbu
              },
              grid: {
                display: true, // Menghilangkan garis grid
              },
            },
          },
        },
      };
      const chart = new Chart(select("#character-chart").item(0), config);
      this.store.set("chart", chart);
    }
    async profile(index, random) {
      select("#character-name").item(0).innerHTML = this.store.get("data")[index].name;
      select("#character-quote-english").item(0).innerHTML = this.store.get("data")[index].quote.english[random];
      select("#character-quote-japan").item(0).innerHTML = this.store.get("data")[index].quote.japan[random];
    }
    async change( button, index ) {
      const randomNumber = Math.floor(Math.random() * 3) + 1;

      select("#character-select button").forEach(element => {
        element.removeAttribute("active");
      });

      const charImage = this.store.get("data")[index].image;
      select("#background-image").item(0).style.backgroundImage = `url('${charImage}')`;
      button.setAttribute("active", 1);

      this.chart(index);
      this.profile(index, randomNumber);

      Nirvana.run("Sound").voice(index, randomNumber);
      Nirvana.run("Sound").effect("selected");

      this.store.set("selected", this.store.get("data")[index]);
    }
    async play() {
      let selected = this.store.get("selected");
      Nirvana.store("Player").set("heroName", selected.name);
      Nirvana.store("Player").set("heroImage", selected.image);
      Nirvana.store("Player").set("heroState", selected.state);
      Nirvana.run("Sound").effect("slash");
      Nirvana.Router.redirect("prepare");
    } 
  }
);

Nirvana.component(
  class Prepare extends Nirvana {
    store = Nirvana.store("Prepare");
    async start() {
      Nirvana.run("Sound").backgroundStop("menu");
      Nirvana.run("Sound").background("game");
      Nirvana.run("Sound").voiceStop();
      Nirvana.run("Sound").encourage();

      select("#background-image").item(0).style.backgroundImage = "none";

      let heroImage = Nirvana.store("Player").get("heroImage");
      select("#prepare-character>img").item(0).setAttribute("src", heroImage);

      await Nirvana.run("Game").prepare();

      setTimeout(()=> {
        Nirvana.Router.redirect("game");
      }, 20000);
    }
  }
);

Nirvana.component(
  class Game extends Nirvana {
    cardEntitiesEmoji = [ "💣", "⭐" ];
    cardMultiple = 2;
    cardEntities = [0, 1, 1, 1];
    store = Nirvana.store("Game");
    async start() {
      select("#background").item(0).style.opacity = 0.4;
      await this.setupCard();
    }
    async prepare() {
      this.store.set("score", 0);
      let heroState = Nirvana.store("Player").get("heroState");
      this.store.set("multiple", heroState[0]);
      await this.setupData();
    }
    async setupCard() {
      this.store.get("data").forEach((data, index) => {
        let card = document.createElement("button");
        card.setAttribute("onclick", `Nirvana.run('Game').select(this, ${index})`);
        select("#game-arena").item(0).append(card);
      });
    }
    async shuffleEntities() {
      let array = this.cardEntities;
      for (let i = array.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [array[i], array[j]] = [array[j], array[i]];
      }
      return array;
    }
    async setupData() {
      for (let index = 0; index < this.store.get("multiple"); index++) {
        this.cardEntities.push(...this.cardEntities);
      }
      this.store.set("data", await this.shuffleEntities());
    }
    async select( button, index ) {
      let selected = this.store.get("data")[index];
      button.innerHTML = this.cardEntitiesEmoji[selected];
      button.setAttribute("active", 1);
      if (selected) {
        this.store.set("score", this.store.get("score") + 1);
        Nirvana.run("Sound").effect("coin");
        select("#game-score").item(0).innerHTML = this.store.get("score");
      }else {
        Nirvana.run("Sound").effect("bomb");
        select("#game-blocked").item(0).style.display = "flex";
      }
    }
    async result(event) {
      Nirvana.store("Player").set("score", this.store.get("score"));
      Nirvana.Router.redirect("result?data="+encodeURIComponent(btoa(JSON.stringify(Array.from(Nirvana.store("Player").entries())))));
      event.preventDefault();
    }
  }
);

Nirvana.component(
  class Result extends Nirvana {
    async start() {
      Nirvana.run("Sound").backgroundStop("game");

      let hash = window.location.hash;
      let paramsString = hash.split('?')[1];
      let params = new URLSearchParams(paramsString);
      let encodedData = params.get('data');

      console.log('Encoded Data:', encodedData);
      let decodedData = decodeURIComponent(encodedData);
      let jsonData = JSON.parse(atob(decodedData));
      let data = new Map(jsonData);

      select("#result-name").item(0).innerHTML = data.get("name");
      select("#result-hero").item(0).innerHTML = data.get("heroName");
      select("#result-score").item(0).innerHTML = data.get("score");
      select("#background-image").item(0).style.backgroundImage = `url('${data.get("heroImage")}')`;
      select("#background-image").item(0).style.animation = 'none';

      let qrcode = new QRCode({
        content: window.location.href,
        padding: 0,
        width: 250,
        height: 250,
        color: "#000000",
        background: "transparent",
        ecl: "M",
      }).svg();
      select("#result-qrcode").item(0).innerHTML = qrcode;
    }
    async share() {
      if (navigator.share) {
        // Mengambil URL saat ini
        let currentUrl = window.location.href;
        // Menggunakan Web Share API
        navigator.share({
          title: document.title, // Title dari halaman
          text: 'Cek halaman ini!',
          url: currentUrl, // URL yang dibagikan
        })
        .then(() => console.log('URL dibagikan dengan sukses!'))
        .catch((error) => console.error('Gagal membagikan URL:', error));
      } else {
        // Jika Web Share API tidak didukung, bisa tampilkan pesan atau fallback ke cara lain
        alert('Web Share API tidak didukung di browser ini.');
      }
    }
    async playAgain() {
      window.location.assign(BASEURL);
    }
  }
);


Nirvana.Router.setup({
  "": {
    prefix: "Main",
    component: Nirvana.run("Loading")
  },
  "register": {
    prefix: "Main",
    component: Nirvana.run("Register")
  },
  "hero": {
    prefix: "Main",
    component: Nirvana.run("Hero")
  },
  "prepare": {
    prefix: "Main",
    component: Nirvana.run("Prepare")
  },
  "game": {
    prefix: "Main",
    component: Nirvana.run("Game")
  },
  "result": {
    prefix: "Main",
    component: Nirvana.run("Result")
  }
});




document.addEventListener("DOMContentLoaded", () => {
  
});