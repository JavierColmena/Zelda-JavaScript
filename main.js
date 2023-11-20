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



    let link = new Player(90, 125, true)
    let oldLinkX, oldLinkY

    let octorok = new Enemigo(-1, -1, 1, animacionArr = [
        [0, 0], [0, 30],//ABAJO
        [31, 0], [31, 30],//IZQUIERDA
        [64, 0], [64, 30],//ARRIBA
        [92, 0], [92, 30]//DERECHA
    ])


    let yArriba, yAbajo, xDerecha, xIzquierda


    let indiceMap = 0

    imagen = new Image()
    imagen.src = "./Imagenes/link.png"

    id1 = setInterval(Draw, 1000 / 60)
    animation = setInterval(animacionPersonajes, 1000 / 10)

    document.addEventListener('keydown', activaMovimiento, false)
    document.addEventListener('keyup', desactivaMovimiento, false)

    function Player(x, y, col) {
        this.x = x
        this.y = y
        this.tileSize = 16

        this.tamañoX = 16 * scale
        this.tamañoY = 16 * scale
        this.velocidad = 2 * scale

        this.canMove = true
        this.isMoving = false

        this.canAtack = true;
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

        //VIDA
        this.maxVida = 3
        this.vida = 1000


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
        
    }


    Player.prototype.imagen = imagen

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
                this.tamañoY + this.tamañoEspadaY);
        }

        // console.log(posicion);
    }

    Player.prototype.atacar = function () {

        if (this.canAtack && this.isAtacking) {
            this.estado = 'atacando'
            this.canMove = false
            this.kinematic = false
            this.isAtacking = true

            //ABAJO 0
            if (this.inicial === 0) {
                this.tamañoEspadaY = 13
                this.tamañoEspadaX = 0
                this.tamañoEspadaXX = 0
                this.tamañoEspadaYY = 0

                this.posicionAtaque = 0
            }
            //IZQUIERDA 2
            else if (this.inicial === 2) {
                this.tamañoEspadaX = 13
                this.tamañoEspadaXX = 10
                this.tamañoEspadaY = 0
                this.tamañoEspadaYY = 0

                this.posicionAtaque = 1
            }
            //DERECHA 4
            else if (this.inicial === 4) {
                this.tamañoEspadaY = 0
                this.tamañoEspadaX = 13
                this.tamañoEspadaXX = 0
                this.tamañoEspadaYY = 0
                this.posicionAtaque = 2
            }
            //ARRIBA 6
            else if (this.inicial === 6) {
                this.tamañoEspadaX = 0
                this.tamañoEspadaXX = 0
                this.tamañoEspadaYY = 14
                this.tamañoEspadaY = 13
                this.posicionAtaque = 3
            }


            setTimeout(() => {
                this.estado = 'idle'
                this.canMove = true
                this.isAtacking = false
            }, 500 / 2);
        }

    }

    Player.prototype.moverJugador = function () {

        if (this.canMove) {
            if (yAbajo && !collision(this.x, this.y + this.velocidad, overworld[indiceMap])) {
                this.y += this.velocidad
                // //TEMPORAL
                if (this.y >= ALTOCANVAS - this.tamañoX) {
                    this.y = ALTOCANVAS - this.tamañoX
                }

            }
            if (yArriba && !collision(this.x, this.y - this.velocidad, overworld[indiceMap])) {
                this.y -= this.velocidad

                if (this.y < 0) {
                    this.y = 0
                }

            }
            if (xDerecha && !collision(this.x + this.velocidad, this.y, overworld[indiceMap])) {
                this.x += this.velocidad
                // TEMPORAL
                if (this.x >= ANCHOCANVAS - this.tamañoX) {
                    this.x = ANCHOCANVAS - this.tamañoX
                }
            }
            if (xIzquierda && !collision(this.x - this.velocidad, this.y, overworld[indiceMap])) {
                this.x -= this.velocidad

                if (this.x < 0) {
                    this.x = 0
                }

            }
        }
    }

    function Enemigo(x, y, vida = 1, animacionArr = []) {
        this.x = x
        this.y = y

        this.tileSize = 16

        this.tamañoX = 16 * scale
        this.tamañoY = 16 * scale
        this.velocidad = 1 * scale

        this.inicial = 0
        this.posicion = 0;

        this.animacionEnemigo = animacionArr

        this.isMoving = false

        this.vida = vida
    }

    imagen = new Image()
    imagen.src = "./Imagenes/enemies.png"

    Enemigo.prototype.imagen = imagen

    Enemigo.prototype.pintarEnemigo = function () {
        ctx.drawImage(this.imagen, // Imagen completa con todos los comecocos (Sprite)
            this.animacionEnemigo[this.posicion][0],    // posicion X del sprite donde se encuentra el comecocos que voy a recortar del sprite para dibujar
            this.animacionEnemigo[this.posicion][1],	  // Posicion Y del sprite donde se encuentra el comecocos que voy a recortar del sprite para dibujar
            this.tileSize, 		    // Tamaño X del comecocos que voy a recortar para dibujar
            this.tileSize,	        // Tamaño Y del comecocos que voy a recortar para dibujar
            this.x,                // Posicion x de pantalla donde voy a dibujar el comecocos recortado
            this.y,				   // Posicion y de pantalla donde voy a dibujar el comecocos recortado
            this.tamañoX,		   // Tamaño X del comecocos que voy a dibujar
            this.tamañoY);
    }

    Enemigo.prototype.moverEnemigo = function () {

        this.isMoving = true
        if (!collision(this.x, this.y + this.velocidad, overworld[indiceMap])) {
            this.y += this.velocidad
        }

        // this.y += this.velocidad
        // if (this.y > ALTOCANVAS) {
        //     this.y = 50
        // }

    }

    let overworld = [
        [
            //MENU
            [22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22],
            [22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22],
            [22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22],
            [22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22],
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
            [61, 61, 61, 61, 61, 61, 61, 61, 61, 61, 61, 61, 61, 61, 61, 61],
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
            [55, 55, 55, 55, 55, 55, 55, 28, 28, 55, 55, 55, 55, 55, 55, 55],
        ]
    ]

    imagen = new Image()
    imagen.src = "./Imagenes/tiles-overworld.png"

    console.table(link.idle);

    function Draw() {
        ctx.clearRect(0, 0, ANCHOCANVAS, ALTOCANVAS);

        // console.log(link);
        //MAPA
        drawWorld()
        changeWorldLinkPosition()
        //JUGADOR
        link.pintarJugador()
        link.moverJugador()
        link.atacar()

        console.log(link.estado);
        //ENEMIGOS
        if (octorok.vida > 0) {
            octorok.pintarEnemigo()
            octorok.moverEnemigo()
        }




        //COMPROBAR COLISION ENE
        console.log(link.posicion)

        if (link.vida === 0) {
            clearInterval(id1)
            clearInterval(animation)
            console.log('Has muerto')
        }
            if (!(link.kinematic) && link.colisiona(octorok)) {
                if (link.isAtacking) {
                    octorok.vida--
                    console.log('OCTOROK VIDA: ' + octorok.vida);
                }
                else {
                    if(link.posicion === 0 || link.posicion === 1){
                        link.y -= 10
                    }
                    else if(link.posicion === 2 || link.posicion === 3){
                        link.x += 10
                    }
                    else if(link.posicion === 4 || link.posicion === 5){
                        link.x -= 10
                    }
                    else if(link.posicion === 6 || link.posicion === 7){
                        link.y += 10
                    }
                    link.vida--;
                    console.log('Link VIDA: ' + link.vida);
                    link.kinematic = true
                }
                setTimeout(function(){
                    link.kinematic = false
                }, 1000)
            }

        //HUD
        drawHUD()

    }

    function drawHUD() {
        let hud
        hud = new Image()
        hud.src = "./Imagenes/hud.png"

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


    }

    //MENÚ & INVENTARIO
    // function drawMenu(){
    //     if(link.ubicacion === "overworld"){
    //         drawImage()
    //     }
    //     if(link.ubicacion === "dungeon"){

    //     }
    // }

    function drawWorld() {
        ctx.save()
        ctx.globalAlpha = 1;
        drawMap(overworld[indiceMap])
        ctx.restore()


    }

    function changeWorldLinkPosition() {
        console.log(link.entrando);
        if(link.entrando === false && indiceMap === 0){
            oldLinkX = link.x
            oldLinkY = link.y
        }
        else if (link.entrando === true && indiceMap === 1) {
            link.x = ANCHOCANVAS / 2
            link.y = ALTOCANVAS - 30
        }
        else if (link.entrando === true && indiceMap === 0){
            link.x = oldLinkX
            link.y = oldLinkY
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
        if (octorok.isMoving) {
            octorok.posicion = octorok.inicial + (octorok.posicion + 1) % 2
        }
    }


    function collision(x, y, map) {
        for (let i = 0; i < map.length; i++) {
            for (let j = 0; j < map[i].length; j++) {
                if (indiceMap === 0 && map[i][j] === 28) {
                    if (x <= j * 16 + 12 &&
                        x + 12 >= j * 16 &&
                        y + 10 <= i * 16 + 16 &&
                        y + 14 >= i * 16) {

                        indiceMap = 1
                        link.entrando = true
                        setTimeout(()=>{
                            link.entrando = false
                        },100)
                        console.log('entrada');
                    }
                }
                else if (indiceMap === 1 && map[i][j] === 28) {
                    if (x <= j * 16 + 12 &&
                        x + 12 >= j * 16 &&
                        y + 10 <= i * 16 + 16 &&
                        y + 14 >= i * 16) {

                        indiceMap = 0
                        link.entrando = true
                        setTimeout(()=>{
                            link.entrando = false
                        },100)
                        console.log('entrada');
                    }
                }
                if (map[i][j] != 2 && map[i][j] != 28 && map[i][j] != 34) {
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