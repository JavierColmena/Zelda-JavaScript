window.onload = () => {

    document.body.style.zoom = "300%"
    const CANVAS = document.getElementById('miCanvas')
    let ctx = CANVAS.getContext('2d')

    let id1, animation, inicio
    const scale = 1 //3
    CANVAS.width = 256 * scale
    CANVAS.height = 240 * scale
    const ANCHOCANVAS = CANVAS.width
    const ALTOCANVAS = CANVAS.height

    let imagen


    let oldLinkX, oldLinkY

    let octoroks = []
    let enemigosFinales = []
    for (let i = 0; i < 10; i++) {
        let enemigo = new Enemigo(16 * i + 20 * 2, ALTOCANVAS / 2 - 4 * 2, 2, 'ganon')
        enemigosFinales.push(enemigo)
    }
    let personajes = []
    let items = []
    let isGenerate = false;

    let yArriba, yAbajo, xDerecha, xIzquierda

    let indiceMap = 0
    let oldIndexMap = 0

    imagen = new Image()
    imagen.src = "./Images/link.png"


    let enter = false

    document.addEventListener('keydown', activaMovimiento, false)
    document.addEventListener('keyup', desactivaMovimiento, false)
    let link, nombre = 'default'

    link = new Player(nombre, 90, 125, false, ctx)


    clearInterval(inicio)
    id1 = setInterval(Draw, 1000 / 60)
    animation = setInterval(animacionPersonajes, 1000 / 10)



    let volMusica = 0.3
    let volSfx = 0.4

    //AUDIO
    let corazonSnd = document.getElementById('corazonSnd')
    corazonSnd.volume = volSfx

    let hurtSnd = document.getElementById('hurtSnd')
    hurtSnd.volume = volSfx

    let itemSnd = document.getElementById('itemSnd')
    itemSnd.volume = volMusica

    let overworldSnd = document.getElementById('overworldSnd')
    overworldSnd.volume = volMusica

    let rupeeSnd = document.getElementById('rupeeSnd')
    rupeeSnd.volume = volSfx

    let swordSnd = document.getElementById('swordSnd')
    swordSnd.volume = volSfx

    let caveSnd = document.getElementById('caveSnd')
    caveSnd.volume = volMusica

    let enemySnd = document.getElementById('enemySnd')
    enemySnd.volume = volSfx

    let bombSnd = document.getElementById('bombSnd')
    bombSnd.volume = volSfx

    let gameOverSnd = document.getElementById('gameOverSnd')
    gameOverSnd.volume = volMusica

    let bossSnd = document.getElementById('bossSnd')
    bossSnd.volume = volMusica

    function Player(nombre_, x, y, col, context) {

        this.nombre = nombre_

        //VIDA
        this.maxVida = 6
        this.vida = 6

        this.x = x
        this.y = y
        this.tileSize = 16

        this.tamañoX = 16 * scale
        this.tamañoY = 16 * scale
        this.velocidad = 2 * scale

        this.canMove = true
        this.isMoving = false

        this.haveSword = false;
        this.isAtacking = false;

        this.ubicacion = "overworld"
        this.entrando = false

        this.inicial = 0
        this.posicion = 0;
        this.posicionAtaque = 0

        this.tamañoEspadaY = 0
        this.tamañoEspadaYY = 14
        this.tamañoEspadaXX = 10
        this.tamañoEspadaX = 0



        let offset = 14

        this.estado = 'idle'

        this.idle =
            [
                //IDLE
                //[X,Y]
                [0, 0], [0, 16 + offset],//ABAJO
                [16 + offset, 0], [16 + offset, 16 + offset],//IZQUIERDA
                [90, 0], [90, 16 + offset],//DERECHA
                [48 + offset, 0], [48 + offset, 16 + offset] /*ARRIBA*/
            ];
        this.atacarAnim = [
            //LINK ATACAR
            [0, 84],//ABAJO
            [24, 90],//IZQUIERDA
            [84, 90],//DERECHA
            [60, 84] /*ARRIBA*/
        ]
        this.takeItem = [0, 150]


        this.rupias = 0
        this.llaves = 0
        this.bombas = 10
        this.isBomb = false
        this.bombasSoltadas = []
        this.soltando = false
        this.kinematic = false;
        this.col = col

        this.itemUsing = [new Item('', 0, 0, 0), new Item('bomba', 0, 0, 0)]

        Player.prototype.soltarBomba = function () {
            //INSERTAR BOMBAS
            if (this.isBomb && this.bombas > 0) {
                if (!this.soltando) {
                    let bomba = new Item('bomba', 1, this.x + 4, this.y + 4, 8, 12)

                    this.bombasSoltadas.push(bomba)
                    this.soltando = true
                    this.bombas--
                }
            }
            else {
                this.soltando = false
            }
            //DIBUJAR BOMBAS
            this.bombasSoltadas.forEach((bomba, index) => {
                bomba.dibujarItem()
                console.log(bomba.explotada);
                if (bomba.explotada) {
                    bombSnd.play()

                    if (this.colisiona(bomba)) {
                        this.recibirDanio()
                    }
                    setTimeout(() => {
                        this.bombasSoltadas.splice(index, 1)
                    }, 200)
                }

                setTimeout(function () {
                    bomba.explotada = true
                }, 1000)
            })

            //CHECK BOMBAS MUNDO
            if (this.entrando) {
                this.bombasSoltadas = []
            }

        }

        //COLISIONES PARA ENEMIGOS
        this.colisiona = function (otherobj) {
            let left = this.x;
            let right = this.x + (this.tamañoX);
            let top = this.y;
            let bottom = this.y + (this.tamañoY);

            let objleft = otherobj.x;
            let objright = otherobj.x + (otherobj.tamañoX);
            let objtop = otherobj.y;
            let objbottom = otherobj.y + (otherobj.tamañoY);
            let crash = true;

            if ((bottom < objtop) ||
                (top > objbottom) ||
                (right < objleft) ||
                (left > objright)) {
                crash = false;
            }
            return crash;
        }


        this.recibirDanio = function () {
            if (!this.parpadeando) {
                this.parpadear();
            }
        }
        //FUNCIONES PARA PARPADEAR CUANDO RECIBE DAÑO
        this.parpadeando = false
        this.context = context;

        this.parpadear = function () {
            this.parpadeando = true;
            const parpadeoInterval = setInterval(() => {
                // Alterna la visibilidad
                if (this.isVisible()) {
                    this.context.globalAlpha = 0;
                    this.pintarJugador();
                } else {
                    this.context.globalAlpha = 1;
                    this.pintarJugador;
                }

                setTimeout(() => {
                    this.context.globalAlpha = 1;
                    this.parpadeando = false;
                    clearInterval(parpadeoInterval);
                }, 1000);

            }, 200);
        }

        this.isVisible = function () {
            return this.context.globalAlpha > 0;
        }


        this.recibirDanio = function () {
            if (!this.parpadeando) {
                hurtSnd.currentTime = 0

                hurtSnd.play()
                this.vida--;
                link.kinematic = true
                this.parpadear();
            }
        }

        Player.prototype.pintarJugador = function () {

            if (this.estado === 'idle') {
                ctx.drawImage(this.imagen, // Imagen completa con todos los comecocos (Sprite)
                    this.idle[this.posicion][0],    // link.posicion X del sprite donde se encuentra el comecocos que voy a recortar del sprite para dibujar
                    this.idle[this.posicion][1],	  // link.posicion Y del sprite donde se encuentra el comecocos que voy a recortar del sprite para dibujar
                    this.tileSize, 		    // Tamaño X del comecocos que voy a recortar para dibujar
                    this.tileSize,	        // Tamaño Y del comecocos que voy a recortar para dibujar
                    this.x,                // Posicion x de pantalla donde voy a dibujar el comecocos recortado
                    this.y,				   // Posicion y de pantalla donde voy a dibujar el comecocos recortado
                    this.tamañoX,		   // Tamaño X del comecocos que voy a dibujar
                    this.tamañoY);
            }
            else if (this.estado === 'atacando') {
                ctx.drawImage(this.imagen, // Imagen completa con todos los comecocos (Sprite)
                    this.atacarAnim[this.posicionAtaque][0],    // Posicion X del sprite donde se encuentra el comecocos que voy a recortar del sprite para dibujar
                    this.atacarAnim[this.posicionAtaque][1],	  // Posicion Y del sprite donde se encuentra el comecocos que voy a recortar del sprite para dibujar
                    this.tileSize + this.tamañoEspadaX, 		    // Tamaño X del comecocos que voy a recortar para dibujar
                    this.tileSize + this.tamañoEspadaY,	        // Tamaño Y del comecocos que voy a recortar para dibujar
                    this.x - this.tamañoEspadaXX,                // Posicion x de pantalla donde voy a dibujar el comecocos recortado
                    this.y - this.tamañoEspadaYY,			   // Posicion y de pantalla donde voy a dibujar el comecocos recortado
                    this.tamañoX + this.tamañoEspadaX,		   // Tamaño X del comecocos que voy a dibujar
                    this.tamañoY + this.tamañoEspadaY
                );

            }
            else if (this.estado === 'taking') {
                ctx.drawImage(this.imagen, // Imagen completa con todos los comecocos (Sprite)
                    this.takeItem[0],    // link.posicion X del sprite donde se encuentra el comecocos que voy a recortar del sprite para dibujar
                    this.takeItem[1],	  // link.posicion Y del sprite donde se encuentra el comecocos que voy a recortar del sprite para dibujar
                    this.tileSize, 		    // Tamaño X del comecocos que voy a recortar para dibujar
                    this.tileSize,	        // Tamaño Y del comecocos que voy a recortar para dibujar
                    this.x,                // Posicion x de pantalla donde voy a dibujar el comecocos recortado
                    this.y,				   // Posicion y de pantalla donde voy a dibujar el comecocos recortado
                    this.tamañoX,		   // Tamaño X del comecocos que voy a dibujar
                    this.tamañoY);
            }
            if (link.col) {
                ctx.strokeStyle = "green";
                ctx.strokeRect(this.x, this.y, this.tamañoX, this.tamañoY);
            }

            // console.log(posicion);
        }

        Player.prototype.espada = {
            x: 0,
            y: 0,
            tamañoX: 3,
            tamañoY: 11,
            colisiona: function (otherobj) {
                let left = this.x;
                let right = this.x + (this.tamañoX);
                let top = this.y;
                let bottom = this.y + (this.tamañoY);

                let objleft = otherobj.x;
                let objright = otherobj.x + (otherobj.tamañoX);
                let objtop = otherobj.y;
                let objbottom = otherobj.y + (otherobj.tamañoY);
                let crash = true;

                if ((bottom < objtop) ||
                    (top > objbottom) ||
                    (right < objleft) ||
                    (left > objright)) {
                    crash = false;
                }
                return crash;
            }
        }

        Player.prototype.atacar = function () {


            if (this.haveSword && this.isAtacking) {
                this.estado = 'atacando'
                this.canMove = false
                this.kinematic = false
                this.isAtacking = true

                //CREAR COL ESPADA
                //Mitad ARRIBA ABAJO -> X:7 Y:16 TamañoX: 3 TamañoY: 11
                //Mitad IZQUIERDA DERECHA -> X:7 Y:16 TamañoX: 11 TamañoY: 3


                //ACTUALIZAR ESPADA TAMAÑO IMAGEN

                //ABAJO 0
                if (this.inicial === 0) {
                    this.tamañoEspadaY = 13
                    this.tamañoEspadaX = 0
                    this.tamañoEspadaXX = 0
                    this.tamañoEspadaYY = 0

                    link.espada.x = link.x
                    link.espada.y = link.y + 16
                    link.espada.tamañoX = 16
                    link.espada.tamañoY = 11
                    if (link.col) {
                        ctx.strokeStyle = "green";
                        ctx.strokeRect(link.espada.x, link.espada.y, link.espada.tamañoX, link.espada.tamañoY);
                    }


                    this.posicionAtaque = 0
                }
                //IZQUIERDA 2
                else if (this.inicial === 2) {
                    this.tamañoEspadaX = 13
                    this.tamañoEspadaXX = 10
                    this.tamañoEspadaY = 0
                    this.tamañoEspadaYY = 0

                    link.espada.x = link.x - 10
                    link.espada.y = link.y
                    link.espada.tamañoX = 11
                    link.espada.tamañoY = 16


                    if (link.col) {
                        ctx.strokeStyle = "green";
                        ctx.strokeRect(link.espada.x, link.espada.y, link.espada.tamañoX, link.espada.tamañoY);
                    }

                    this.posicionAtaque = 1
                }
                //DERECHA 4
                else if (this.inicial === 4) {
                    this.tamañoEspadaY = 0
                    this.tamañoEspadaX = 13
                    this.tamañoEspadaXX = 0
                    this.tamañoEspadaYY = 0

                    link.espada.x = link.x + 16
                    link.espada.y = link.y
                    link.espada.tamañoX = 11
                    link.espada.tamañoY = 16

                    if (link.col) {
                        ctx.strokeStyle = "green";
                        ctx.strokeRect(link.espada.x, link.espada.y, link.espada.tamañoX, link.espada.tamañoY);
                    }

                    this.posicionAtaque = 2
                }
                //ARRIBA 6
                else if (this.inicial === 6) {
                    this.tamañoEspadaX = 0
                    this.tamañoEspadaXX = 0
                    this.tamañoEspadaYY = 14
                    this.tamañoEspadaY = 13

                    link.espada.x = link.x
                    link.espada.y = link.y - 14
                    link.espada.tamañoX = 16
                    link.espada.tamañoY = 15

                    if (link.col) {
                        ctx.strokeStyle = "green";
                        ctx.strokeRect(link.espada.x, link.espada.y, link.espada.tamañoX, link.espada.tamañoY);
                    }

                    this.posicionAtaque = 3
                }

                swordSnd.currentTime = 0

                swordSnd.play()

                setTimeout(() => {

                    this.estado = 'idle'
                    this.canMove = true
                    this.isAtacking = false

                    link.espada.x = null
                    link.espada.y = null

                }, 500 / 2);
            }

        }

        Player.prototype.moverJugador = function () {

            if (this.canMove) {
                if (yAbajo && !collision(this.x, this.y + this.velocidad, overworld[indiceMap], true)) {
                    this.y += this.velocidad
                    // //TEMPORAL
                    if (this.y >= ALTOCANVAS - this.tamañoX) {
                        this.y = ALTOCANVAS - this.tamañoX
                    }

                }
                if (yArriba && !collision(this.x, this.y - this.velocidad, overworld[indiceMap], true)) {
                    this.y -= this.velocidad

                    if (this.y < 0) {
                        this.y = 0
                    }

                }
                if (xDerecha && !collision(this.x + this.velocidad, this.y, overworld[indiceMap], true)) {
                    this.x += this.velocidad
                    // TEMPORAL
                    if (this.x >= ANCHOCANVAS - this.tamañoX) {
                        this.x = ANCHOCANVAS - this.tamañoX
                    }
                }
                if (xIzquierda && !collision(this.x - this.velocidad, this.y, overworld[indiceMap], true)) {
                    this.x -= this.velocidad

                    if (this.x < 0) {
                        this.x = 0
                    }

                }
            }
        }

        Player.prototype.getLocalStorage = function () {
            const storedData = JSON.parse(localStorage.getItem("player")) || {};
            this.x = storedData.x || this.x
            this.y = storedData.y || this.y
            this.haveSword = storedData.haveSword || this.haveSword
            this.ubicacion = storedData.ubicacion || this.ubicacion;
            this.rupias = storedData.rupias || this.rupias;
            this.llaves = storedData.llaves || this.llaves;
            this.bombas = storedData.bombas || this.bombas;
            indiceMap = storedData.indiceMap || indiceMap
        };

        Player.prototype.setLocalStorage = function () {
            const dataToStore = {
                x: this.x,
                y: this.y,
                haveSword: this.haveSword,
                ubicacion: this.ubicacion,
                rupias: this.rupias,
                llaves: this.llaves,
                bombas: this.bombas,
                indiceMap: indiceMap
            };

            localStorage.setItem("player", JSON.stringify(dataToStore));
        };

    }

    Player.prototype.imagen = imagen

    let xRan = 0, yRan = 0
    let spawnCooldown = false

    function Enemigo(x, y, vida = 1, nombre) {
        this.x = x
        this.y = y

        this.nombre = nombre;

        this.canMove = false;

        this.tileSize = 16

        this.tamañoX = 16 * scale
        this.tamañoY = 16 * scale
        this.velocidad = 1 * scale

        this.inicial = 0
        this.posicion = 0;

        this.colXTocada = false;
        this.colYTocada = false;

        this.randomItem = Math.floor(1 + Math.random() * 2)

        this.itemGenerate = false;


        if (this.nombre === 'octorok') {
            this.animacionEnemigo = [
                [0, 0], [0, 30],//ABAJO
                [31, 0], [31, 30],//IZQUIERDA
                [60, 0], [60, 30],//ARRIBA
                [90, 0], [90, 30]//DERECHA
            ]
        }
        else if (this.nombre === 'ganon') {
            this.animacionEnemigo = [
                [120, 120], [120, 120 + 30],//ABAJO
                [120 + 31, 120], [120 + 31, 120 + 30],//IZQUIERDA
                [120 + 60, 120], [120 + 60, 120 + 30],//ARRIBA
                [120 + 90, 120], [120 + 90, 120 + 30]//DERECHA
            ]
        }

        this.isMoving = true

        this.vida = vida

        this.estado = 'idle'

        //COLISIONES PARA ENEMIGOS
        this.colisiona = function (otherobj) {
            let left = this.x;
            let right = this.x + (this.tamañoX);
            let top = this.y;
            let bottom = this.y + (this.tamañoY);

            let objleft = otherobj.x - 16;
            let objright = otherobj.x + (otherobj.tamañoX) + 16;
            let objtop = otherobj.y - 16;
            let objbottom = otherobj.y + (otherobj.tamañoY) + 16;
            let crash = true;

            if ((bottom < objtop) ||
                (top > objbottom) ||
                (right < objleft) ||
                (left > objright)) {
                crash = false;
            }
            return crash;
        }

        Enemigo.prototype.pintarEnemigo = function () {
            ctx.save()
            ctx.globalAlpha = 1;

            if (this.estado === 'idle') {
                ctx.drawImage(this.imagen, // Imagen completa con todos los comecocos (Sprite)
                    this.animacionEnemigo[this.posicion][0],    // posicion X del sprite donde se encuentra el comecocos que voy a recortar del sprite para dibujar
                    this.animacionEnemigo[this.posicion][1],	  // Posicion Y del sprite donde se encuentra el comecocos que voy a recortar del sprite para dibujar
                    this.tileSize, 		    // Tamaño X del comecocos que voy a recortar para dibujar
                    this.tileSize,	        // Tamaño Y del comecocos que voy a recortar para dibujar
                    this.x,                // Posicion x de pantalla donde voy a dibujar el comecocos recortado
                    this.y,				   // Posicion y de pantalla donde voy a dibujar el comecocos recortado
                    this.tamañoX,		   // Tamaño X del comecocos que voy a dibujar
                    this.tamañoY);

                // ctx.strokeStyle = "red";
                // ctx.strokeRect(this.x, this.y, this.tamañoX, this.tamañoY);
            }
            if (this.estado === 'muerto') {
                this.imagen = new Image()
                this.imagen.src = "./Images/enemyDeath.png"

                this.animacionEnemigo = [0, 16, 32, 48]

                ctx.drawImage(this.imagen, // Imagen completa con todos los comecocos (Sprite)
                    this.animacionEnemigo[this.posicion],    // posicion X del sprite donde se encuentra el comecocos que voy a recortar del sprite para dibujar
                    0,	  // Posicion Y del sprite donde se encuentra el comecocos que voy a recortar del sprite para dibujar
                    this.tileSize, 		    // Tamaño X del comecocos que voy a recortar para dibujar
                    this.tileSize,	        // Tamaño Y del comecocos que voy a recortar para dibujar
                    this.x,                // Posicion x de pantalla donde voy a dibujar el comecocos recortado
                    this.y,				   // Posicion y de pantalla donde voy a dibujar el comecocos recortado
                    this.tamañoX,		   // Tamaño X del comecocos que voy a dibujar
                    this.tamañoY);
                // ctx.strokeStyle = "purple";
                // ctx.strokeRect(this.x, this.y, this.tamañoX, this.tamañoY);
            }

            ctx.restore()
        }

        Enemigo.prototype.moverEnemigo = function () {
            //ABAJO -> Y + VELOCIDAD
            //ARRIBA -> Y - VELOCIDAD
            //DERECHA -> X + VELOCIDAD
            //IZQUIERDA -> X - VELOCIDAD

            if (this.isMoving) {
                xRan = Math.floor(Math.random() * 2);
                yRan = Math.floor(Math.random() * 2);


                if (xRan === 1 && yRan === 0) {
                    if (!collision(this.x + this.velocidad, this.y, overworld[indiceMap], false) && !this.colXTocada) {
                        this.x += this.velocidad
                        this.inicial = 6
                    }
                    else if (!collision(this.x - this.velocidad, this.y, overworld[indiceMap], false)) {
                        this.colXTocada = true
                        this.x -= this.velocidad
                        this.inicial = 2
                    }
                    else {
                        this.colXTocada = false;
                    }
                }
                else {
                    if (!collision(this.x, this.y + this.velocidad, overworld[indiceMap], false) && !this.colYTocada) {
                        this.y += this.velocidad
                        this.inicial = 0
                    }
                    else if (!collision(this.x, this.y - this.velocidad, overworld[indiceMap], false)) {
                        this.colYTocada = true
                        this.y -= this.velocidad
                        this.inicial = 4
                    }
                    else {
                        this.colYTocada = false
                    }
                }
            }



            // this.y += this.velocidad
            // if (this.y > ALTOCANVAS) {
            //     this.y = 50
            // }

        }
    }

    imagen = new Image()
    imagen.src = "./Images/enemies.png"

    Enemigo.prototype.imagen = imagen


    function Personajes(x_, y_, nombre_) {
        this.x = x_
        this.y = y_
        this.tamañoX = 16
        this.tamañoY = 16

        this.nombre = nombre_

        Personajes.prototype.pintarPersonaje = function () {
            ctx.save()
            ctx.globalAlpha = 1;
            if (this.nombre === 'oldman') {
                ctx.drawImage(this.imagen, // Imagen completa con todos los comecocos (Sprite)
                    0,    // link.posicion X del sprite donde se encuentra el comecocos que voy a recortar del sprite para dibujar
                    0,	  // link.posicion Y del sprite donde se encuentra el comecocos que voy a recortar del sprite para dibujar
                    this.tamañoX, 		    // Tamaño X del comecocos que voy a recortar para dibujar
                    this.tamañoY,	        // Tamaño Y del comecocos que voy a recortar para dibujar
                    this.x,                // Posicion x de pantalla donde voy a dibujar el comecocos recortado
                    this.y,				   // Posicion y de pantalla donde voy a dibujar el comecocos recortado
                    this.tamañoX,		   // Tamaño X del comecocos que voy a dibujar
                    this.tamañoY);
            }
            ctx.restore()
        }

    }

    imagen = new Image()
    imagen.src = "./Images/ZeldaSpriteOldMan.png"
    Personajes.prototype.imagen = imagen

    let itemEnemigo = []

    function generarPersonajesPantalla(indiceMap) {
        if (indiceMap === 1) {
            if (!isGenerate) {

                let personaje = new Personajes(CANVAS.width / 2 - 8, CANVAS.height / 2, 'oldman')
                personajes.push(personaje)

                if (!link.haveSword) {
                    let item = new Item('espada', 0, CANVAS.width / 2 - 4, CANVAS.height / 2 + 30, 8, 16)
                    items.push(item)
                }

                isGenerate = true;
            }


            personajes.forEach(personaje => {
                personaje.pintarPersonaje()
            });

            //CHECK ITEM COL
            let swordAp = false
            items.forEach(item => {
                item.dibujarItem()
                let index = items.indexOf(item)
                if (link.haveSword || link.colisiona(item)) {
                    if (item.nombre === 'espada') {
                        link.itemUsing[0].nombre = 'espada'
                        itemSnd.play()

                        link.haveSword = true
                        link.estado = 'taking'


                        ctx.drawImage(item.imagen, // Imagen completa con todos los comecocos (Sprite)
                            104,    // Posicion X del sprite donde se encuentra el comecocos que voy a recortar del sprite para dibujar
                            0,	  // Posicion Y del sprite donde se encuentra el comecocos que voy a recortar del sprite para dibujar
                            8, 		    // Tamaño X del comecocos que voy a recortar para dibujar
                            16,	        // Tamaño Y del comecocos que voy a recortar para dibujar
                            link.x + 4,                // Posicion x de pantalla donde voy a dibujar el comecocos recortado
                            link.y - 15,
                            item.tamañoX,
                            item.tamañoY);



                        link.canMove = false
                        setTimeout(function () {
                            items.splice(index, 1)
                            link.estado = 'idle'
                            link.canMove = true
                        }, 1000 * itemSnd.duration)
                    }
                }
            });


        }
        else if (indiceMap === 2) {
            if (!isGenerate) {
                link.canMove = false

                let octorok = new Enemigo(50, 100, 1, 'octorok')
                octoroks.push(octorok)

                octorok = new Enemigo(190, 160, 1, 'octorok')
                octoroks.push(octorok)

                octorok = new Enemigo(130, 80, 1, 'octorok')
                octoroks.push(octorok)

                octorok = new Enemigo(180, 100, 1, 'octorok')
                octoroks.push(octorok)

                octorok = new Enemigo(65, 100, 1, 'octorok')
                octoroks.push(octorok)

                isGenerate = true;
            }

            setTimeout(function () {
                link.canMove = true
                spawnCooldown = true
            }, 1000)

            if (spawnCooldown) {
                octoroks.forEach(octorok => {

                    octorok.pintarEnemigo()
                    octorok.moverEnemigo()

                });
            }

        }
        else {
            octoroks = []
            personajes = []
            items = []
            isGenerate = false;
            spawnCooldown = false
        }
    }

    let overworld = [
        [
            //MENU
            [22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22],
            [22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22],
            [22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22],
            [22, 22, 22, 22, 22, 22, 22, 0, 0, 22, 22, 22, 22, 22, 22, 22],
            //MAPA
            [61, 61, 61, 61, 61, 61, 61, 2, 2, 61, 61, 61, 61, 61, 61, 61],
            [61, 61, 61, 61, 28, 61, 62, 2, 2, 61, 61, 61, 61, 61, 61, 61],
            [61, 61, 61, 62, 2, 2, 2, 2, 2, 61, 61, 61, 61, 61, 61, 61],
            [61, 61, 62, 2, 2, 2, 2, 2, 2, 61, 61, 61, 61, 61, 61, 61],
            [61, 62, 2, 2, 2, 2, 2, 2, 2, 60, 61, 61, 61, 61, 61, 61],
            [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
            [43, 43, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 43, 43],
            [61, 61, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 61, 61],
            [61, 61, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 61, 61],
            [61, 61, 43, 43, 43, 43, 43, 43, 43, 43, 43, 43, 43, 43, 61, 61],
            [61, 61, 61, 61, 61, 61, 61, 61, 61, 61, 61, 61, 61, 61, 61, 61],
            [61, 61, 61, 61, 61, 61, 61, 61, 61, 61, 61, 61, 61, 61, 61, 61]
        ],
        [
            //MENU
            [22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22],
            [22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22],
            [22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22],
            [22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22],

            //MAPA
            [55, 55, 55, 55, 55, 55, 55, 55, 55, 55, 55, 55, 55, 55, 55, 55],
            [55, 55, 55, 55, 55, 55, 55, 55, 55, 55, 55, 55, 55, 55, 55, 55],
            [55, 55, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 55, 55],
            [55, 55, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 55, 55],
            [55, 55, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 55, 55],
            [55, 55, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 55, 55],
            [55, 55, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 55, 55],
            [55, 55, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 55, 55],
            [55, 55, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 55, 55],
            [55, 55, 55, 55, 55, 55, 55, 34, 34, 55, 55, 55, 55, 55, 55, 55],
            [55, 55, 55, 55, 55, 55, 55, 28, 28, 55, 55, 55, 55, 55, 55, 55]
        ],
        [
            //MENU
            [22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22],
            [22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22],
            [22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22],
            [22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22],

            //MAPA
            [61, 61, 61, 61, 61, 61, 61, 61, 61, 61, 61, 61, 61, 61, 61, 61],
            [61, 61, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 61, 61],
            [61, 61, 2, 2, 2, 2, 3, 4, 4, 5, 2, 2, 2, 2, 61, 61],
            [61, 61, 2, 2, 2, 20, 21, 28, 28, 23, 20, 2, 2, 2, 61, 61],
            [61, 61, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 61, 61],
            [61, 61, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 61, 61],
            [61, 61, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 61, 61],
            [61, 61, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 61, 61],
            [61, 61, 1, 2, 1, 2, 2, 2, 2, 2, 2, 1, 2, 1, 61, 61],
            [61, 61, 43, 43, 43, 43, 43, 2, 2, 43, 43, 43, 43, 43, 61, 61],
            [61, 61, 61, 61, 61, 61, 61, 2, 2, 61, 61, 61, 61, 61, 61, 61],
            [61, 61, 61, 61, 61, 61, 61, 0, 0, 61, 61, 61, 61, 61, 61, 61]
        ],
        [
            //MENU
            [22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22],
            [22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22],
            [22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22],
            [22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22],

            //MAPA
            [105, 105, 105, 105, 105, 105, 105, 105, 105, 105, 105, 105, 105, 105, 105, 105],
            [105, 105, 105, 105, 105, 105, 105, 105, 105, 105, 105, 105, 105, 105, 105, 105],
            [105, 105, 104, 104, 104, 104, 104, 104, 104, 104, 104, 104, 104, 104, 105, 105],
            [105, 105, 104, 104, 104, 104, 104, 104, 104, 104, 104, 104, 104, 104, 105, 105],
            [105, 105, 104, 104, 104, 104, 104, 104, 104, 104, 104, 104, 104, 104, 105, 105],
            [105, 105, 104, 104, 104, 104, 104, 104, 104, 104, 104, 104, 104, 104, 105, 105],
            [105, 105, 104, 104, 104, 104, 104, 104, 104, 104, 104, 104, 104, 104, 105, 105],
            [105, 105, 104, 104, 104, 104, 104, 104, 104, 104, 104, 104, 104, 104, 105, 105],
            [105, 105, 104, 104, 104, 104, 104, 104, 104, 104, 104, 104, 104, 104, 105, 105],
            [105, 105, 104, 104, 104, 104, 104, 104, 104, 104, 104, 104, 104, 104, 105, 105],
            [105, 105, 105, 105, 105, 105, 105, 104, 104, 105, 105, 105, 105, 105, 105, 105],
            [105, 105, 105, 105, 105, 105, 105, 28, 28, 105, 105, 105, 105, 105, 105, 105]
        ]
    ]

    imagen = new Image()
    imagen.src = "./Images/tiles-overworld2.png"


    function Draw() {
        ctx.clearRect(0, 0, ANCHOCANVAS, ALTOCANVAS);
        if (enter) {
            // console.log(link);
            //MAPA
            nombre = document.getElementById('nombre').value
            document.getElementById('nombre').style.display = 'none'

            link.nombre = nombre

            drawWorld()
            checkWorldObjects()

            //ENEMIGOS
            generarPersonajesPantalla(indiceMap)
            spawnBoss()

            //JUGADOR
            link.soltarBomba()
            link.pintarJugador()
            link.moverJugador()
            link.atacar()

            //COMPROBAR COLISION ENE
            checkEnemyCol()
            ItemController()
            //HUD
            drawHUD()

            checkPlayerHealth()
            // setPlayerData()

        }
        else {
            pantallaInicio()
        }



    }

    function pantallaInicio() {

        console.log(enter);
        ctx.font = '16px zeldaNes';
        ctx.fillStyle = 'yellowgreen'
        ctx.fillText('ZELDA NES JS', (ANCHOCANVAS / 2) - 90, ALTOCANVAS / 2 - 30);

        ctx.font = '7px zeldaNes';
        ctx.fillStyle = 'white'
        ctx.fillText('PRESS ENTER', (ANCHOCANVAS / 2) - 35, ALTOCANVAS / 2 - 10);

        ctx.font = '7px zeldaNes';
        ctx.fillStyle = 'white'
        ctx.fillText('JAVIER COLMENA MARTOS', (ANCHOCANVAS / 2) - 70, ALTOCANVAS / 2 + 50);


    }

    function pantallaGanador() {
        ctx.save()
        ctx.globalAlpha = 1
        ctx.clearRect(0, 0, ANCHOCANVAS, ALTOCANVAS);
        ctx.font = '16px zeldaNes';
        ctx.fillStyle = 'yellow'
        ctx.fillText('Has ganado', (ANCHOCANVAS / 2) - 80, ALTOCANVAS / 2);

        ctx.font = '7px zeldaNes';
        ctx.fillStyle = 'white'
        ctx.fillText('enhorabuena', (ANCHOCANVAS / 2) - 40, ALTOCANVAS / 2 + 20);
        ctx.restore()
    }

    function pantallaMuerte() {
        ctx.save()
        ctx.globalAlpha = 1
        ctx.clearRect(0, 0, ANCHOCANVAS, ALTOCANVAS);
        ctx.font = '16px zeldaNes';
        ctx.fillStyle = 'red'
        ctx.fillText('Has perdido', (ANCHOCANVAS / 2) - 90, ALTOCANVAS / 2);

        ctx.font = '7px zeldaNes';
        ctx.fillStyle = 'white'
        ctx.fillText('otra vez sera...', (ANCHOCANVAS / 2) - 55, ALTOCANVAS / 2 + 20);
        ctx.restore()
    }

    function spawnBoss() {
        if (indiceMap === 3) {
            let enemiesToRemove = [];
            enemigosFinales.forEach(enemigo => {
                enemigo.pintarEnemigo()
                enemigo.moverEnemigo()
            });
            enemigosFinales.forEach(enemigo => {
                if (!(link.kinematic) && link.colisiona(enemigo)) {

                    // NOCKBACK
                    if (link.posicion === 0 || link.posicion === 1) {
                        link.y -= 10
                    }
                    else if (link.posicion === 2 || link.posicion === 3) {
                        link.x += 10
                    }
                    else if (link.posicion === 4 || link.posicion === 5) {
                        link.x -= 10
                    }
                    else if (link.posicion === 6 || link.posicion === 7) {
                        link.y += 10
                    }
                    if (enemigo.estado != 'muerto') {
                        link.recibirDanio()
                    }

                    // console.log('Link VIDA: ' + link.vida);

                    setTimeout(function () {
                        link.kinematic = false
                    }, 2000)


                }
                link.bombasSoltadas.forEach(bomba => {
                    if (bomba.explotada && enemigo.colisiona(bomba)) {
                        enemigo.vida--

                        if (enemigo.vida <= 0) {
                            enemigo.estado = 'muerto'
                            enemigo.isMoving = false;
                            enemigo.vida = 0
                            setTimeout(function () {
                                if (enemigo.randomItem === 1 && !enemigo.itemGenerate) {
                                    itemEnemigo.push(new Item('rupia', 5, enemigo.x, enemigo.y, 8, 16))
                                    enemigo.itemGenerate = true
                                }
                                else if (enemigo.randomItem === 2 && !enemigo.itemGenerate) {
                                    itemEnemigo.push(new Item('corazon', 1, enemigo.x, enemigo.y, 8, 8))
                                    enemigo.itemGenerate = true
                                }
                                enemiesToRemove.push(enemigo);
                                enemySnd.play()
                            }, 200);
                        }
                    }
                })
                if (link.isAtacking && link.espada.colisiona(enemigo)) {
                    link.kinematic = true

                    setTimeout(function () {
                        link.kinematic = false
                    }, 1000)

                    enemigo.vida--

                    if (enemigo.vida <= 0) {
                        enemigo.estado = 'muerto'
                        enemigo.isMoving = false;
                        enemigo.vida = 0
                        setTimeout(function () {
                            if (enemigo.randomItem === 1 && !enemigo.itemGenerate) {
                                itemEnemigo.push(new Item('rupia', 5, enemigo.x, enemigo.y, 8, 16))
                                enemigo.itemGenerate = true
                            }
                            else if (enemigo.randomItem === 2 && !enemigo.itemGenerate) {
                                itemEnemigo.push(new Item('corazon', 1, enemigo.x, enemigo.y, 8, 8))
                                enemigo.itemGenerate = true
                            }
                            enemiesToRemove.push(enemigo);
                            enemySnd.play()
                        }, 200);
                    }

                }

            });

            setTimeout(function () {
                enemiesToRemove.forEach(enemyToRemove => {
                    const index = enemigosFinales.indexOf(enemyToRemove);
                    if (index !== -1) {
                        enemigosFinales.splice(index, 1);
                    }
                });
            }, 200);

        }
    }

    function checkPlayerHealth() {
        if(enemigosFinales.length === 0){
            ctx.clearRect(0, 0, ANCHOCANVAS, ALTOCANVAS);

            overworldSnd.pause()
            caveSnd.pause()
            enemySnd.pause()
            bossSnd.pause()


            clearInterval(id1)
            clearInterval(animation)

            pantallaGanador()
        }
        else if (link.vida <= 0) {
            ctx.clearRect(0, 0, ANCHOCANVAS, ALTOCANVAS);

            overworldSnd.pause()
            caveSnd.pause()
            enemySnd.pause()
            bossSnd.pause()

            gameOverSnd.play()

            clearInterval(id1)
            clearInterval(animation)

            pantallaMuerte()
            console.log('Has muerto')
        }
    }
    function checkEnemyCol() {

        let enemiesToRemove = [];

        if(octoroks.length > 0){
            overworld[2][7][7] = 55
            overworld[2][7][8] = 55
        }
        else{
            overworld[2][7][7] = 28
            overworld[2][7][8] = 28
        }

        octoroks.forEach(octorok => {
            if (!(link.kinematic) && link.colisiona(octorok)) {

                // NOCKBACK
                if (link.posicion === 0 || link.posicion === 1) {
                    link.y -= 10
                }
                else if (link.posicion === 2 || link.posicion === 3) {
                    link.x += 10
                }
                else if (link.posicion === 4 || link.posicion === 5) {
                    link.x -= 10
                }
                else if (link.posicion === 6 || link.posicion === 7) {
                    link.y += 10
                }
                if (octorok.estado != 'muerto') {
                    link.recibirDanio()
                }

                // console.log('Link VIDA: ' + link.vida);

                setTimeout(function () {
                    link.kinematic = false
                }, 2000)


            }
            link.bombasSoltadas.forEach(bomba => {
                if (bomba.explotada && octorok.colisiona(bomba)) {
                    octorok.vida--

                    if (octorok.vida <= 0) {
                        octorok.estado = 'muerto'
                        octorok.isMoving = false;
                        octorok.vida = 0
                        setTimeout(function () {
                            if (octorok.randomItem === 1 && !octorok.itemGenerate) {
                                itemEnemigo.push(new Item('rupia', 5, octorok.x, octorok.y, 8, 16))
                                octorok.itemGenerate = true
                            }
                            else if (octorok.randomItem === 2 && !octorok.itemGenerate) {
                                itemEnemigo.push(new Item('corazon', 1, octorok.x, octorok.y, 8, 8))
                                octorok.itemGenerate = true
                            }
                            enemiesToRemove.push(octorok);
                            enemySnd.play()
                        }, 200);
                    }
                }
            })
            if (link.isAtacking && link.espada.colisiona(octorok)) {
                link.kinematic = true

                setTimeout(function () {
                    link.kinematic = false
                }, 1000)

                octorok.vida--

                if (octorok.vida <= 0) {
                    octorok.estado = 'muerto'
                    octorok.isMoving = false;
                    octorok.vida = 0
                    setTimeout(function () {
                        if (octorok.randomItem === 1 && !octorok.itemGenerate) {
                            itemEnemigo.push(new Item('rupia', 5, octorok.x, octorok.y, 8, 16))
                            octorok.itemGenerate = true
                        }
                        else if (octorok.randomItem === 2 && !octorok.itemGenerate) {
                            itemEnemigo.push(new Item('corazon', 1, octorok.x, octorok.y, 8, 8))
                            octorok.itemGenerate = true
                        }
                        enemiesToRemove.push(octorok);
                        enemySnd.play()
                    }, 200);
                }
                // console.log('OCTOROK VIDA: ' + octorok.vida);


            }


        });

        setTimeout(function () {
            enemiesToRemove.forEach(enemyToRemove => {
                const index = octoroks.indexOf(enemyToRemove);
                if (index !== -1) {
                    octoroks.splice(index, 1);
                }
            });
        }, 200);
    }

    function drawHUD() {
        let hud
        hud = new Image()
        hud.src = "./Images/hud.png"
        ctx.save()
        ctx.globalAlpha = 1;
        ctx.fillStyle = 'black'
        ctx.fillRect(0, 0, 256, 65)
        //HUD PRINCIPAL 256 x 56
        ctx.drawImage(hud, // Imagen completa con todos los comecocos (Sprite)
            258,    // Posicion X del sprite donde se encuentra el comecocos que voy a recortar del sprite para dibujar
            11,	  // Posicion Y del sprite donde se encuentra el comecocos que voy a recortar del sprite para dibujar
            256, 		    // Tamaño X del comecocos que voy a recortar para dibujar
            56,	        // Tamaño Y del comecocos que voy a recortar para dibujar
            0,                // Posicion x de pantalla donde voy a dibujar el comecocos recortado
            0,
            256,
            56);

        //MAPA 64 x 40
        ctx.drawImage(hud, // Imagen completa con todos los comecocos (Sprite)
            519,    // Posicion X del sprite donde se encuentra el comecocos que voy a recortar del sprite para dibujar
            1,	  // Posicion Y del sprite donde se encuentra el comecocos que voy a recortar del sprite para dibujar
            64, 		    // Tamaño X del comecocos que voy a recortar para dibujar
            40,	        // Tamaño Y del comecocos que voy a recortar para dibujar
            16,                // Posicion x de pantalla donde voy a dibujar el comecocos recortado
            8,
            64,
            40);

        //HELTH COUNT
        healthController()
        //RUPEE COUNT
        rupeeController()
        //KEY COUNT
        keyController()
        //BOMBS COUNT
        bombController()

        //ITEMS
        ItemsHUD()

        ctx.restore()
    }

    function rupeeController() {

        let x = 96, y = 23

        //Fondo negro
        ctx.fillStyle = 'black'
        ctx.fillRect(x, y - 7, 8 * 3, 8)

        ctx.font = '8px zeldaNes';

        if (link.rupias >= 15) {
            link.rupias = 15
            ctx.fillStyle = 'greenyellow';

        }
        else {
            ctx.fillStyle = 'white';
        }
        if (link.rupias < 0) {
            link.rupias = 0
        }

        if (link.rupias >= 10) {
            ctx.fillText('X' + link.rupias, x, y);
        }
        else {
            ctx.fillText('X0' + link.rupias, x, y);
        }



    }
    function keyController() {

        let x = 96, y = 23 + 16

        //Fondo negro
        ctx.fillStyle = 'black'
        ctx.fillRect(x, y - 7, 8 * 3, 8)

        ctx.font = '8px zeldaNes';

        if (link.llaves >= 99) {
            link.llaves = 99
            ctx.fillStyle = 'greenyellow';

        }
        else {
            ctx.fillStyle = 'white';
        }
        if (link.llaves < 0) {
            link.llaves = 0
        }

        if (link.llaves >= 10) {
            ctx.fillText('X' + link.llaves, x, y);
        }
        else {
            ctx.fillText('X0' + link.llaves, x, y);
        }



    }
    function bombController() {

        let x = 96, y = 23 + 16 + 8

        //Fondo negro
        ctx.fillStyle = 'black'
        ctx.fillRect(x, y - 7, 8 * 3, 8)

        ctx.font = '8px zeldaNes';

        if (link.bombas >= 99) {
            link.bombas = 99
            ctx.fillStyle = 'greenyellow';

        }
        else {
            ctx.fillStyle = 'white';
        }
        if (link.bombas < 0) {
            link.bombas = 0
        }

        if (link.bombas >= 10) {
            ctx.fillText('X' + link.bombas, x, y);
        }
        else {
            ctx.fillText('X0' + link.bombas, x, y);
        }



    }

    function ItemsHUD() {
        //Y1: 24 X1:128
        //TAMAÑOX: 8 TAMAÑOY: 16

        //Y2: 24 X2:152


        link.itemUsing[0].x = 128
        link.itemUsing[0].y = 24
        link.itemUsing[0].tamañoX = 8
        link.itemUsing[0].tamañoY = 16

        link.itemUsing[1].x = 152
        link.itemUsing[1].y = 24
        link.itemUsing[1].tamañoX = 8
        link.itemUsing[1].tamañoY = 16

        ctx.fillStyle = 'black'
        ctx.fillRect(link.itemUsing[0].x, link.itemUsing[0].y, link.itemUsing[0].tamañoX, link.itemUsing[0].tamañoY)

        ctx.fillStyle = 'black'
        ctx.fillRect(link.itemUsing[1].x, link.itemUsing[1].y, link.itemUsing[1].tamañoX, link.itemUsing[1].tamañoY)

        link.itemUsing[0].dibujarItem()
        link.itemUsing[1].dibujarItem()


    }

    function ItemController() {
        itemEnemigo.forEach(item => {
            item.dibujarItem()
            item.dropItemController()
        })
    }

    function Item(nombre_, valor_, x_, y_, tamañoX_, tamañoY_) {
        this.nombre = nombre_
        this.valor = valor_

        this.x = x_
        this.y = y_

        this.tamañoX = tamañoX_
        this.tamañoY = tamañoY_

        this.imagen = new Image()
        this.imagen.src = './Images/items.png'

        this.explotada = false


        Item.prototype.dibujarItem = function () {
            ctx.save()
            ctx.globalAlpha = 1;
            if (this.nombre === 'rupia') {
                //RUPIA IMG
                ctx.drawImage(this.imagen, // Imagen completa con todos los comecocos (Sprite)
                    72,    // link.posicion X del sprite donde se encuentra el comecocos que voy a recortar del sprite para dibujar
                    0,	  // link.posicion Y del sprite donde se encuentra el comecocos que voy a recortar del sprite para dibujar
                    8, 		    // Tamaño X del comecocos que voy a recortar para dibujar
                    16,	        // Tamaño Y del comecocos que voy a recortar para dibujar
                    this.x,                // Posicion x de pantalla donde voy a dibujar el comecocos recortado
                    this.y,				   // Posicion y de pantalla donde voy a dibujar el comecocos recortado
                    this.tamañoX,
                    this.tamañoY);
            }
            else if (this.nombre === 'corazon') {
                //CORAZON IMG
                ctx.drawImage(this.imagen, // Imagen completa con todos los comecocos (Sprite)
                    0,    // Posicion X del sprite donde se encuentra el comecocos que voy a recortar del sprite para dibujar
                    0,	  // Posicion Y del sprite donde se encuentra el comecocos que voy a recortar del sprite para dibujar
                    8, 		    // Tamaño X del comecocos que voy a recortar para dibujar
                    8,	        // Tamaño Y del comecocos que voy a recortar para dibujar
                    this.x,                // Posicion x de pantalla donde voy a dibujar el comecocos recortado
                    this.y,
                    this.tamañoX,
                    this.tamañoY);
            }
            else if (this.nombre === 'espada') {
                //ESPADA IMG
                ctx.drawImage(this.imagen, // Imagen completa con todos los comecocos (Sprite)
                    104,    // Posicion X del sprite donde se encuentra el comecocos que voy a recortar del sprite para dibujar
                    0,	  // Posicion Y del sprite donde se encuentra el comecocos que voy a recortar del sprite para dibujar
                    8, 		    // Tamaño X del comecocos que voy a recortar para dibujar
                    16,	        // Tamaño Y del comecocos que voy a recortar para dibujar
                    this.x,                // Posicion x de pantalla donde voy a dibujar el comecocos recortado
                    this.y,
                    this.tamañoX,
                    this.tamañoY);
            }
            else if (this.nombre === 'bomba') {

                //BOMBA IMG
                if (!this.explotada) {
                    ctx.drawImage(this.imagen, // Imagen completa con todos los comecocos (Sprite)
                        136,    // Posicion X del sprite donde se encuentra el comecocos que voy a recortar del sprite para dibujar
                        0,	  // Posicion Y del sprite donde se encuentra el comecocos que voy a recortar del sprite para dibujar
                        8, 		    // Tamaño X del comecocos que voy a recortar para dibujar
                        16,	        // Tamaño Y del comecocos que voy a recortar para dibujar
                        this.x,                // Posicion x de pantalla donde voy a dibujar el comecocos recortado
                        this.y,
                        this.tamañoX,
                        this.tamañoY);
                }
                else {
                    this.imagen = new Image()
                    this.imagen.src = "./Images/enemyDeath.png"

                    ctx.drawImage(this.imagen, // Imagen completa con todos los comecocos (Sprite)
                        16,    // posicion X del sprite donde se encuentra el comecocos que voy a recortar del sprite para dibujar
                        0,	  // Posicion Y del sprite donde se encuentra el comecocos que voy a recortar del sprite para dibujar
                        16, 		    // Tamaño X del comecocos que voy a recortar para dibujar
                        16,	        // Tamaño Y del comecocos que voy a recortar para dibujar
                        this.x - 2,                // Posicion x de pantalla donde voy a dibujar el comecocos recortado
                        this.y - 1,				   // Posicion y de pantalla donde voy a dibujar el comecocos recortado
                        16,		   // Tamaño X del comecocos que voy a dibujar
                        16);
                }

            }
            ctx.restore()

        }

        Item.prototype.dropItemController = function () {

            if (!link.entrando) {
                this.dibujarItem()
                if (link.colisiona(this) && this.nombre === 'rupia') {
                    rupeeSnd.currentTime = 0

                    rupeeSnd.play()

                    link.rupias += this.valor
                    // console.log(link.rupias);
                    itemEnemigo.splice(itemEnemigo.indexOf(this), 1)

                }
                if (link.colisiona(this) && this.nombre === 'corazon') {
                    corazonSnd.currentTime = 0

                    corazonSnd.play()
                    link.vida++
                    itemEnemigo.splice(itemEnemigo.indexOf(this), 1)
                }
            }
            else {
                itemEnemigo = []
            }
        }

    }

    function healthController() {
        let items = new Image()
        items.src = './Images/items.png'
        let x = 0
        let y = 0
        //8 X 8
        //434 X 43

        if (link.vida > link.maxVida) {
            link.vida = link.maxVida
        }
        if (link.maxVida > 16) {
            link.maxVida = 16
        }

        //FONDO NEGRO
        ctx.fillStyle = 'black'
        ctx.fillRect(168, 32, 8 * 9, 16)

        for (let i = 0; i < link.maxVida; i++) {
            x++
            if (x > 8) {
                x = 1
                y++
            }
            if (i < link.vida) {
                ctx.fillRect(168 + 8 * x, 32 + 8 * y, 8, 8)
                ctx.drawImage(items, // Imagen completa con todos los comecocos (Sprite)
                    0,    // Posicion X del sprite donde se encuentra el comecocos que voy a recortar del sprite para dibujar
                    0,	  // Posicion Y del sprite donde se encuentra el comecocos que voy a recortar del sprite para dibujar
                    8, 		    // Tamaño X del comecocos que voy a recortar para dibujar
                    8,	        // Tamaño Y del comecocos que voy a recortar para dibujar
                    168 + 8 * x,                // Posicion x de pantalla donde voy a dibujar el comecocos recortado
                    32 + 8 * y,
                    8,
                    8);
            }
            else {
                ctx.fillRect(168 + 8 * x, 32 + 8 * y, 8, 8)
                ctx.drawImage(items, // Imagen completa con todos los comecocos (Sprite)
                    16,    // Posicion X del sprite donde se encuentra el comecocos que voy a recortar del sprite para dibujar
                    0,	  // Posicion Y del sprite donde se encuentra el comecocos que voy a recortar del sprite para dibujar
                    8, 		    // Tamaño X del comecocos que voy a recortar para dibujar
                    8,	        // Tamaño Y del comecocos que voy a recortar para dibujar
                    168 + 8 * x,                // Posicion x de pantalla donde voy a dibujar el comecocos recortado
                    32 + 8 * y,
                    8,
                    8);
            }
        }
    }

    function drawWorld() {
        ctx.save()
        ctx.globalAlpha = 1;
        drawMap(overworld[indiceMap])
        ctx.restore()


    }

    function checkWorldObjects() {

        //COMPRUEBA Y MODIFICA LA UBICACION
        switch (indiceMap) {
            case 0:
            case 2:
                caveSnd.currentTime = 0
                bossSnd.currentTime = 0
                overworldSnd.play()
                bossSnd.pause()
                link.ubicacion = 'overworld'
                break;
            case 1:
                overworldSnd.currentTime = 0
                overworldSnd.pause()

                caveSnd.play()

                link.ubicacion = 'cueva'
                break;
            case 3:
                overworldSnd.pause()
                caveSnd.pause()
                bossSnd.play()

                link.ubicacion = 'dungeon'
                break;
        }

        //GUARDAR ULTIMA COORDENADA DE LA PANTALLA 0
        if (link.entrando === false && indiceMap === 0) {
            oldLinkX = link.x
            oldLinkY = link.y
        }

        //CUEVA COORD
        if (link.entrando === true && indiceMap === 1) {
            link.x = ANCHOCANVAS / 2 - 8
            link.y = ALTOCANVAS - 45
        }
        else if (link.entrando === true && indiceMap === 0) {
            link.x = oldLinkX
            link.y = oldLinkY
        }

        //PANTALLA 3 COORD
        if (link.entrando === true && indiceMap === 2) {
            link.x = ANCHOCANVAS / 2 - 8
            link.y = ALTOCANVAS - 30
        }
        else if (link.entrando === true && indiceMap === 0) {
            oldIndexMap = 0
            link.x = oldLinkX
            link.y = oldLinkY
        }

        //PANTALLA 4 COORD
        if (link.entrando === true && indiceMap === 3) {
            oldIndexMap = 3
            link.x = ANCHOCANVAS / 2 - 8
            link.y = ALTOCANVAS - 30
        }
        else if (link.entrando === true && indiceMap === 2 && oldIndexMap === 3) {
            link.x = oldLinkX
            link.y = 130
        }


    }

    function drawMap(mapa) {
        for (let i = 0; i < mapa.length; i++) {
            for (let j = 0; j < mapa[i].length; j++) {

                ctx.drawImage(imagen,
                    ((mapa[i][j] % 18) * 17) + 1,
                    (Math.floor(mapa[i][j] / 18) * 17) + 1,
                    16,
                    16,
                    j * 16 * scale,
                    i * 16 * scale,
                    16 * scale,
                    16 * scale)
            }

        }
    }

    function animacionPersonajes() {
        if (link.isMoving) {
            link.posicion = link.inicial + (link.posicion + 1) % 2
        }

        octoroks.forEach(octorok => {
            if (octorok.isMoving && octorok.estado === 'idle') {
                octorok.posicion = octorok.inicial + (octorok.posicion + 1) % 2
            }
            else {
                octorok.posicion = (octorok.posicion + 1) % 4
            }
        });
        enemigosFinales.forEach(enemigo => {
            if (enemigo.isMoving && enemigo.estado === 'idle') {
                enemigo.posicion = enemigo.inicial + (enemigo.posicion + 1) % 2
            }
            else {
                enemigo.posicion = (enemigo.posicion + 1) % 4
            }
        });
    }

    function collision(x, y, map, isLink) {
        for (let i = 0; i < map.length; i++) {
            for (let j = 0; j < map[i].length; j++) {
                //Esto es una cerdada, pero no me da tiempo a hacer dinámico

                if (isLink) {
                    //IR DE LA PANTALLA 0 A LA 1
                    if (indiceMap === 0 && map[i][j] === 28) {
                        if (x <= j * 16 + 12 &&
                            x + 12 >= j * 16 &&
                            y + 10 <= i * 16 + 16 &&
                            y + 14 >= i * 16) {

                            indiceMap = 1
                            link.entrando = true
                            setTimeout(() => {
                                link.entrando = false
                            }, 100)
                            console.log('entrada');
                        }
                    }
                    //VOLVER DE LA PANTALLA 1 A LA PANTALLA 0
                    else if (indiceMap === 1 && map[i][j] === 28) {
                        if (x <= j * 16 + 12 &&
                            x + 12 >= j * 16 &&
                            y + 10 <= i * 16 + 16 &&
                            y + 14 >= i * 16) {

                            indiceMap = 0
                            link.entrando = true
                            setTimeout(() => {
                                link.entrando = false
                            }, 100)
                            console.log('Salida');
                        }
                    }

                    //IR DE LA PANTALLA 0 A LA 3
                    if (indiceMap === 0 && map[i][j] === 0) {
                        if (x <= j * 16 + 12 &&
                            x + 12 >= j * 16 &&
                            y + 10 <= i * 16 + 16 &&
                            y + 14 >= i * 16) {

                            indiceMap = 2
                            link.entrando = true
                            setTimeout(() => {
                                link.entrando = false
                            }, 100)
                            console.log('entrada');
                        }
                    }
                    // VOLVER DE LA PANTALLA 3 A LA 0
                    else if (indiceMap === 2 && map[i][j] === 0) {
                        if (x <= j * 16 + 12 &&
                            x + 12 >= j * 16 &&
                            y + 10 <= i * 16 + 16 &&
                            y + 14 >= i * 16) {

                            indiceMap = 0
                            link.entrando = true
                            setTimeout(() => {
                                link.entrando = false
                            }, 100)
                            console.log('salida');
                        }
                    }
                    //TODO
                    //IR DE LA PANTALLA 3 A LA 4 //FINAL
                    if (indiceMap === 2 && map[i][j] === 28) {
                        if (x <= j * 16 + 12 &&
                            x + 12 >= j * 16 &&
                            y + 10 <= i * 16 + 16 &&
                            y + 14 >= i * 16) {

                            indiceMap = 3
                            link.entrando = true
                            setTimeout(() => {
                                link.entrando = false
                            }, 100)
                            console.log('entrada');
                        }
                    }
                    // VOLVER DE LA PANTALLA 4 A LA 2
                    else if (indiceMap === 3 && map[i][j] === 28) {
                        if (x <= j * 16 + 12 &&
                            x + 12 >= j * 16 &&
                            y + 10 <= i * 16 + 16 &&
                            y + 14 >= i * 16) {

                            indiceMap = 2
                            link.entrando = true
                            setTimeout(() => {
                                link.entrando = false
                            }, 100)
                            console.log('salida');
                        }
                    }
                }

                //COLISIONES CON EL RESTO DEL MAPA
                if (map[i][j] != 2 && map[i][j] != 34 && map[i][j] != 104) {
                    if (x <= j * 16 + 12 &&
                        x + 12 >= j * 16 &&
                        y + 10 <= i * 16 + 16 &&
                        y + 14 >= i * 16) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    function activaMovimiento(evt) {

        switch (evt.keyCode) {
            //Izquierda
            case 37:
                link.inicial = 2
                xIzquierda = true;
                link.isMoving = true

                break;
            //Arriba
            case 38:
                link.inicial = 6
                yArriba = true;
                link.isMoving = true

                break;
            //Derecha
            case 39:
                link.inicial = 4
                xDerecha = true;
                link.isMoving = true

                break;
            //Abajo
            case 40:
                link.inicial = 0
                yAbajo = true;
                link.isMoving = true

                break;
            //ATACAR X
            case 88:
                link.isAtacking = true;
                break;
            //SOLTAR BOMBA C
            case 67:
                link.isBomb = true;
                break;
        }

        if (evt.key === 'Enter') {
            enter = true
        }

    }

    function desactivaMovimiento(evt) {
        switch (evt.keyCode) {
            //Izquierda
            case 37:
                xIzquierda = false;
                break;
            //Arriba
            case 38:
                yArriba = false;
                break;
            // Derecha
            case 39:
                xDerecha = false;
                break;
            //Abajo
            case 40:
                yAbajo = false;
                break;

            //ATACAR X
            case 88:
                link.isAtacking = false;
                break;
            //SOLTAR BOMBA C
            case 67:
                link.isBomb = false;
                break;

        }

        link.isMoving = xIzquierda || yArriba || xDerecha || yAbajo;
    }
    }