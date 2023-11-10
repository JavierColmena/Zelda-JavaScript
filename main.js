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

    let github = 'hola'

    let imagen


    // let link = new Player(ANCHOCANVAS / 2, ALTOCANVAS / 2, true)
    let link = new Player(90, 125, true)

    let inicial = 0
    let posicion = 0;
    let yArriba, yAbajo, xDerecha, xIzquierda


    let indiceMap = 0

    imagen = new Image()
    imagen.src = "./Imagenes/link.png"

    id1 = setInterval(Draw, 1000 / 60)
    animation = setInterval(animacionLink, 1000 / 15)
    document.addEventListener('keydown', activaMovimiento, false)
    document.addEventListener('keyup', desactivaMovimiento, false)

    function Player(x, y, col) {
        this.x = x
        this.y = y
        this.tileSize = 16

        this.tamañoX = 16 * scale
        this.tamañoY = 16 * scale
        this.velocidad = 2 * scale

        this.isMoving = false

        this.canAtack = false;
        this.isAtacking = false;


        let offset = 14
        this.animacionLink =
            [
                //[X,Y]
                [0, 0], [0, 16 + offset],//ABAJO
                [16 + offset, 0], [16 + offset, 16 + offset],//IZQUIERDA
                [90, 0], [90, 16 + offset],//DERECHA
                [48 + offset, 0], [48 + offset, 16 + offset] /*ARRIBA*/,

                //LINK ATACAR

                [0, 60], [0, 84],//ABAJO
                [16 + offset, 60], [16 + offset, 84],//IZQUIERDA
                [90, 60], [90, 84],//DERECHA
                [48 + offset, 60], [48 + offset, 84] /*ARRIBA*/,

            ];

        //COLISIONES PARA ENEMIGOS
        if (col) {
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
    }


    Player.prototype.imagen = imagen


    //NO ES MIA, ES DE CHATGPT
    Player.prototype.colisionaConMapa = function (pantalla) {
        // Calcula las coordenadas de los tiles que el jugador está tocando
        const tileX = Math.floor((this.x + this.tamañoX / 2) / this.tamañoX);
        const tileY = Math.floor((this.y + this.tamañoY - 8 / 2) / this.tamañoY);

        // Verifica la colisión con el tile en el que se encuentra el jugador
        const tileValue = pantalla[tileY][tileX];
        return !arrayCaminables.includes(tileValue);
    };

    let overworld = [
        [
            //MENU
            [22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22],
            [22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22],
            [22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22],
            [22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22],
            //MAPA
            [25, 25, 25, 25, 25, 25, 25, 2, 2, 96, 97, 97, 97, 97, 97, 97],
            [25, 25, 25, 25, 25, 25, 25, 2, 2, 96, 97, 97, 97, 97, 97, 97],
            [25, 25, 2, 2, 2, 2, 2, 2, 2, 96, 97, 97, 97, 97, 97, 97],
            [25, 25, 2, 2, 2, 2, 2, 2, 2, 96, 97, 97, 97, 97, 97, 97],
            [2, 2, 2, 2, 2, 2, 2, 2, 2, 96, 97, 97, 97, 97, 97, 97],
            [2, 2, 2, 2, 2, 2, 2, 2, 2, 114, 115, 115, 115, 115, 115, 115],
            [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
            [25, 25, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
            [25, 25, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
            [25, 25, 25, 2, 2, 2, 25, 25, 25, 25, 2, 2, 2, 25, 25, 2],
            [25, 25, 25, 2, 2, 2, 25, 25, 25, 25, 2, 2, 2, 25, 25, 2]
        ],
        [
            //MENU
            [22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22],
            [22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22],
            [22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22],
            [22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22],
            //MAPA
            [25, 25, 25, 25, 25, 25, 25, 2, 2, 96, 97, 97, 97, 97, 97, 97],
            [25, 25, 25, 25, 25, 25, 25, 2, 2, 96, 97, 97, 97, 97, 97, 97],
            [25, 25, 2, 2, 2, 2, 2, 2, 2, 96, 97, 97, 97, 97, 97, 97],
            [25, 25, 2, 2, 2, 2, 25, 2, 2, 96, 97, 97, 97, 97, 97, 97],
            [2, 2, 2, 2, 2, 2, 2, 2, 2, 96, 97, 97, 97, 97, 97, 97],
            [2, 2, 2, 2, 2, 2, 25, 2, 2, 114, 115, 115, 115, 115, 115, 115],
            [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
            [25, 25, 2, 2, 2, 2, 25, 2, 2, 2, 2, 2, 2, 2, 2, 2],
            [25, 25, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
            [25, 25, 25, 2, 2, 2, 25, 25, 25, 25, 2, 2, 2, 25, 25, 2],
            [25, 25, 25, 2, 2, 2, 25, 25, 25, 25, 2, 2, 2, 25, 25, 2]
        ]
    ]

    imagen = new Image()
    imagen.src = "./Imagenes/tiles-overworld.png"

    console.table(link.animacionLink);

    function Draw() {
        ctx.clearRect(0, 0, ANCHOCANVAS, ALTOCANVAS);

        // console.log(link);
        //MAPA
        drawWorld()
        //JUGADOR
        link.pintarJugador()
        link.moverJugador()
        //HUD
        drawHUD()

    }

    function drawHUD(){
        let hud 
        hud = new Image()
        hud.src = "./Imagenes/hud.png"
        
        ctx.fillRect(0,0,256,65)
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

    function drawWorld() {
        ctx.save()
        ctx.globalAlpha = 1;
        drawMap(overworld[indiceMap])
        ctx.restore()
        if (link.y < (16 * 4) - 8) {
            indiceMap = 0
        }
        if (link.x <= 0) {
            indiceMap = 1
        }
    }

    function drawMap(mapa) {
        for (let i = 0; i < mapa.length; i++) {
            for (let j = 0; j < mapa[i].length; j++) {
                // ctx.drawImage(imagen, // Imagen completa con todos los comecocos (Sprite)
                // ((overworld[i][j] * 14.5) + 1),    // Posicion X del sprite donde se encuentra el comecocos que voy a recortar del sprite para dibujar
                // (overworld[i][j] * 0 + 1),	  // Posicion Y del sprite donde se encuentra el comecocos que voy a recortar del sprite para dibujar
                // 16, 		    // Tamaño X del comecocos que voy a recortar para dibujar
                // 16,	        // Tamaño Y del comecocos que voy a recortar para dibujar
                // 16 * j * scale,                // Posicion x de pantalla donde voy a dibujar el comecocos recortado
                // 16 * i * scale,				   // Posicion y de pantalla donde voy a dibujar el comecocos recortado
                // 16,		   // Tamaño X del comecocos que voy a dibujar
                // 16);


                //AUN TRATANDO DE ENTENDERLO

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

    function animacionLink() {
        if (link.isMoving) {
            posicion = inicial + (posicion + 1) % 2
        }
    }

    //NO ES MIA
    function collision(x, y, map) {
        for (let i = 0; i < map.length; i++) {
            for (let j = 0; j < map[i].length; j++) {
                if (map[i][j] != 2 && map[i][j] != 28) {
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

    Player.prototype.pintarJugador = function () {
        ctx.drawImage(link.imagen, // Imagen completa con todos los comecocos (Sprite)
            link.animacionLink[posicion][0],    // Posicion X del sprite donde se encuentra el comecocos que voy a recortar del sprite para dibujar
            link.animacionLink[posicion][1],	  // Posicion Y del sprite donde se encuentra el comecocos que voy a recortar del sprite para dibujar
            link.tileSize, 		    // Tamaño X del comecocos que voy a recortar para dibujar
            link.tileSize,	        // Tamaño Y del comecocos que voy a recortar para dibujar
            link.x,                // Posicion x de pantalla donde voy a dibujar el comecocos recortado
            link.y,				   // Posicion y de pantalla donde voy a dibujar el comecocos recortado
            link.tamañoX,		   // Tamaño X del comecocos que voy a dibujar
            link.tamañoY);
        // console.log(posicion);
    }

    Player.prototype.moverJugador = function () {


        if (yAbajo && !collision(link.x, link.y + link.velocidad, overworld[indiceMap])) {
            this.y += this.velocidad
            // //TEMPORAL
            if (this.y >= ALTOCANVAS - this.tamañoX) {
                this.y = ALTOCANVAS - this.tamañoX
            }

        }
        if (yArriba && !collision(link.x, link.y - link.velocidad, overworld[indiceMap])) {
            this.y -= this.velocidad

            if (this.y < 0) {
                this.y = 0
            }
        }
        if (xDerecha && !collision(link.x + link.velocidad, link.y, overworld[indiceMap])) {
            this.x += this.velocidad
            // TEMPORAL
            if (this.x >= ANCHOCANVAS - this.tamañoX) {
                this.x = ANCHOCANVAS - this.tamañoX
            }
        }
        if (xIzquierda && !collision(link.x - link.velocidad, link.y, overworld[indiceMap])) {
            this.x -= this.velocidad

            if (this.x < 0) {
                this.x = 0
            }            

        }
    }

    function activaMovimiento(evt) {

        switch (evt.keyCode) {
            //Izquierda
            case 37:
                inicial = 2
                xIzquierda = true;
                break;
            //Arriba
            case 38:
                inicial = 6
                yArriba = true;
                break;
            //Derecha
            case 39:
                inicial = 4
                xDerecha = true;
                break;
            //Abajo
            case 40:
                inicial = 0
                yAbajo = true;
                break;
            //ATACANDO
            case 88:
                link.isAtacking = true;
                break;

        }

        link.isMoving = true
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

            //ATACAR
            case 88:
                link.isAtacking = false;
                break;

        }

        link.isMoving = xIzquierda || yArriba || xDerecha || yAbajo;
    }
}