class NotesSpace {
    constructor(settings) {
        NotesSpace.x = settings.x;
        NotesSpace.y = settings.y;
        NotesSpace.width = settings.width;
        NotesSpace.height = settings.height;
        NotesSpace.color = settings.color;

        NotesSpace.objects = [
            {
                type : "gradient-rectangle",
                x : 0,
                y : 0,
                x1 : 2000,
                y1 : 1000,
                xPos : Canvas.canvas.width/2,
                yPos : 0,
                width : 20,
                height : 100,
                fillRect1 : 1,
                fillRect2 : 1,
                color1 : "rgb(100,100,100)",
                color2 : "rgb(0,0,0)"
            }
        ];

        //Canvas.objects[Canvas.objects.length] = NotesSpace.objects;
    }
}