window.onload = () =>{

    const CANVAS = document.getElementById('miCanvas')
    const ctx = CANVAS.getContext('2d')
    let id1, animation

    const ANCHO = CANVAS.width
    const ALTO = CANVAS.height

    function player(x,y,col){
        this.x = x
        this.y =  y
        this.tamanoX =  16
        this.tamanoY =  16

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
        ctx.fillRect(0,0,25,25)
        ctx.fillStyle = 'red'
    }


    id1 = setInterval(Update,1000/60)
}