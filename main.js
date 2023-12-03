window.onload = () => {

    document.body.style.zoom = "300%"
    const CANVAS = document.getElementById('miCanvas')
    let ctx = CANVAS.getContext('2d')

    let id1, animation
    const scale = 1 //3
    CANVAS.width = 256 * scale
    CANVAS.height = 240 * scale
    const ANCHOCANVAS = CANVAS.width
    const ALTOCANVAS = CANVAS.height

    let imagen

    // let link = new Player(ANCHOCANVAS / 2, ALTOCANVAS / 2, true)



    let link = new Player(90, 125, false, ctx)
    let oldLinkX, oldLinkY

    let octoroks = []
    let personajes = []
    let items = []
    let isGenerate = false;


    let yArriba, yAbajo, xDerecha, xIzquierda


    let indiceMap = 0

    imagen = new Image()
    imagen.src = "./Images/link.png"

    id1 = setInterval(Draw, 1000 / 60)
    animation = setInterval(animacionPersonajes, 1000 / 10)

    document.addEventListener('keydown', activaMovimiento, false)
    document.addEventListener('keyup', desactivaMovimiento, false)


    //AUDIO
    let corazonSnd = document.getElementById('corazonSnd')
    let hurtSnd = document.getElementById('hurtSnd')
    let itemSnd = document.getElementById('itemSnd')


    function Player(x, y, col, context) {

        //VIDA
        this.maxVida = 6
        this.vida = 3

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
        this.bombas = 0
        this.kinematic = false;
        this.col = col



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
                this.vida -= 10;
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
                hurtSnd.volume = 0.2
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

    }

    Player.prototype.imagen = imagen

    let xRan = 0, yRan = 0
    let spawnCooldown = false

    function Enemigo(x, y, vida = 1, nombre) {
        this.x = x
        this.y = y

        this.nombre = nombre;

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

        this.isMoving = true

        this.vida = vida

        this.estado = 'idle'

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
                if (link.colisiona(item)) {
                    if (item.nombre === 'espada') {
                        itemSnd.volume = 0.2
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
        ]
    ]

    imagen = new Image()
    imagen.src = "./Images/tiles-overworld.png"

    console.table(link.idle);

    function Draw() {
        ctx.clearRect(0, 0, ANCHOCANVAS, ALTOCANVAS);
        // console.log(link);
        //MAPA
        drawWorld()
        checkWorldObjects()

        //ENEMIGOS
        generarPersonajesPantalla(indiceMap)

        //JUGADOR
        link.pintarJugador()
        link.moverJugador()
        link.atacar()

        //COMPROBAR COLISION ENE
        checkEnemyCol()
        ItemController()
        //HUD
        drawHUD()

    }

    function checkEnemyCol() {
        if (link.vida === 0) {
            clearInterval(id1)
            clearInterval(animation)
            console.log('Has muerto')
        }

        let enemiesToRemove = [];

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

                console.log('Link VIDA: ' + link.vida);

                setTimeout(function () {
                    link.kinematic = false
                }, 2000)


            }
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
                    }, 200);
                }
                console.log('OCTOROK VIDA: ' + octorok.vida);


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
        ctx.fillRect(0, 0, 256, 65)
        ctx.fillStyle = 'black'
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

        healthController()

        ctx.restore()
    }

    function ItemController(){
        itemEnemigo.forEach(item =>{
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
            ctx.restore()

        }

        Item.prototype.dropItemController = function () {
            if (indiceMap === 2) {
                this.dibujarItem()
                if (link.colisiona(this) && this.nombre === 'rupia') {
                    itemEnemigo.splice(itemEnemigo.indexOf(this), 1)
                    link.rupias += this.valor
                }
                if (link.colisiona(this) && this.nombre === 'corazon') {
                    corazonSnd.currentTime = 0
                    corazonSnd.volume = .2
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
                link.ubicacion = 'overworld'
                break;
            case 1:
                link.ubicacion = 'cueva'
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
            link.x = oldLinkX
            link.y = oldLinkY + 5
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
                            console.log('entrada');
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
                            console.log('entrada');
                        }
                    }
                }

                //COLISIONES CON EL RESTO DEL MAPA
                if (map[i][j] != 2 && map[i][j] != 34) {
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

        }

        link.isMoving = xIzquierda || yArriba || xDerecha || yAbajo;
    }
}