window.onload = () => {

    const CANVAS = document.getElementById('miCanvas')
    let ctx = CANVAS.getContext('2d')

    let id1, animation
    CANVAS.width = 256
    CANVAS.height = 240
    const ANCHOCANVAS = CANVAS.width
    const ALTOCANVAS = CANVAS.height
    const scale = 1

    let imagen


    let link = new Player(ANCHOCANVAS / 2, ALTOCANVAS / 2, true)

    let inicial = 0
    let posicion = 0;
    let yArriba, yAbajo, xDerecha, xIzquierda


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
        this.velocidad = 2

        this.isMoving = false

        let offset = 14
        this.animacionLink =
            [
                [0, 0], [0, 16 + offset],//ABAJO
                [16 + offset, 0], [16 + offset, 16 + offset],//IZQUIERDA
                [90, 0], [90, 16 + offset],//DERECHA
                [48 + offset, 0], [48 + offset, 16 + offset] //ARRIBA
            ];

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

    Player.prototype.colisionaConMapa = function (mapa) {
        // Calcula las coordenadas de los tiles que el jugador está tocando
        const tileX = Math.floor((this.x + this.tamañoX / 2) / this.tamañoX);
        const tileY = Math.floor((this.y + this.tamañoY / 2) / this.tamañoY);

        // Verifica la colisión con el tile en el que se encuentra el jugador
        const tileValue = mapa[tileY][tileX];
        return tileValue !== 2;
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
            [25, 25, 2, 2, 2, 2, 25, 2, 2, 96, 97, 97, 97, 97, 97, 97],
            [2, 2, 2, 2, 2, 2, 2, 2, 2, 96, 97, 97, 97, 97, 97, 97],
            [2, 2, 2, 2, 2, 2, 25, 2, 2, 114, 115, 115, 115, 115, 115, 115],
            [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
            [25, 25, 2, 2, 2, 2, 25, 2, 2, 2, 2, 2, 2, 2, 2, 2],
            [25, 25, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
            [25, 25, 25, 2, 2, 2, 25, 25, 25, 25, 2, 2, 2, 25, 25, 2],
            [25, 25, 25, 2, 2, 2, 25, 25, 25, 25, 2, 2, 2, 25, 25, 2],
        ]
    ]

    imagen = new Image()
    imagen.src = "./Imagenes/tiles-overworld.png"

    console.table(link.animacionLink);

    function Draw() {
        ctx.clearRect(0, 0, ANCHOCANVAS, ALTOCANVAS);

        // console.log(link);

        drawMap(overworld[0])
        link.pintarJugador()
        link.moverJugador()

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
                    j * 16,
                    i * 16,
                    16,
                    16)
            }
        }
    }

    function animacionLink() {
        if (link.isMoving) {
            posicion = inicial + (posicion + 1) % 2
        }
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

        const oldX = this.x;
        const oldY = this.y;

        if (yAbajo) {
            this.y += this.velocidad
            // //TEMPORAL
            if (this.y >= ALTOCANVAS - this.tamañoX) {
                this.y = ALTOCANVAS - this.tamañoX
            }
            if (this.colisionaConMapa(overworld[0])) {
                this.y = oldY; // Revertir movimiento si hay colisión
            }

        }
        if (yArriba) {
            this.y -= this.velocidad

            if (this.y < 0) {
                this.y = 0
            }
            if (this.colisionaConMapa(overworld[0])) {
                this.y = oldY; // Revertir movimiento si hay colisión
            }
        }
        if (xDerecha) {
            this.x += this.velocidad
            // TEMPORAL
            if (this.x >= ANCHOCANVAS - this.tamañoX) {
                this.x = ANCHOCANVAS - this.tamañoX
            }
            if (this.colisionaConMapa(overworld[0])) {
                this.x = oldX;
            }
        }
        if (xIzquierda) {
            this.x -= this.velocidad

            if (this.x < 0) {
                this.x = 0
            }
            if (this.colisionaConMapa(overworld[0])) {
                this.x = oldX;
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

        }

        link.isMoving = xIzquierda || yArriba || xDerecha || yAbajo;
    }
}