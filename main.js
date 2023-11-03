window.onload = () =>{

    const CANVAS = document.getElementById('miCanvas')
    let ctx = CANVAS.getContext('2d')

    let id1, animation

    const ANCHO = CANVAS.width
    const ALTO = CANVAS.height  

    let imagen

    imagen = new Image()
    imagen.src = "link.png"


    let link = new Player(0, 0, true)
    
    Player.prototype.image = imagen

    let inicial = 0
	let posicion = 0;

    let yArriba,yAbajo,xDerecha,xIzquierda

    function Player(x,y,col){
        this.x = x
        this.y = y
        this.tamañoX = 16  
        this.tamañoY = 16


        this.animacionLink =
			[[0, 0], [0, 16],//ABAJO
			[16, 0], [16, 16],//IZQUIERDA
			[32, 0], [32, 16],//ARRIBA
			[48, 0], [48, 16] /*DERECHA*/];

        if(col){
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



    function Update(){
        Draw()
    }

    function Draw(){
        ctx.clearRect(0, 0, 500, 500);

        console.log(link);

        ctx.drawImage(link.image, // Imagen completa con todos los comecocos (Sprite)
        link.animacionLink[0][0],    // Posicion X del sprite donde se encuentra el comecocos que voy a recortar del sprite para dibujar
        link.animacionLink[0][1],	  // Posicion Y del sprite donde se encuentra el comecocos que voy a recortar del sprite para dibujar
        link.tamañoX, 		    // Tamaño X del comecocos que voy a recortar para dibujar
        link.tamañoY,	        // Tamaño Y del comecocos que voy a recortar para dibujar
        link.x,                // Posicion x de pantalla donde voy a dibujar el comecocos recortado
        link.y,				   // Posicion y de pantalla donde voy a dibujar el comecocos recortado
        link.tamañoX * 3,		   // Tamaño X del comecocos que voy a dibujar
        link.tamañoY * 3);
    }

    function animacionLink() {

		if (yArriba) {
			inicial = 9
		}
		if (xDerecha) {
			inicial = 6
		}
		if (xIzquierda) {
			inicial = 3
		}
		if (yAbajo) {
			inicial = 0
		}

		posicion = inicial + (posicion + 1) % 3
    
    }

    id1 = setInterval(Update,1000/60)
    animation = setInterval(animacionLink, 1000/10)
}