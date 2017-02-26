function Square(x,y, gridSize, numberOfColumns, color, numberOfAllowedMoves){
    this.x = x;
    this.y = y;
    this.gridSize = gridSize;
    this.numberOfColumns = numberOfColumns;
    this.color = color;
    this.allowedMoves = numberOfAllowedMoves;

    this.show = function() {
        // stroke(255,146,139);
        fill(this.color)
        rect(this.x * this.gridSize, this.y * this.gridSize, this.gridSize, this.gridSize);
    }

    this.move = function(keyPress, original){
        switch(keyPress){
            case RIGHT_ARROW:
            this.moveBlock(this.x+1, this.y, original);
            break;
            case LEFT_ARROW:
            this.moveBlock(this.x-1, this.y, original);
            break;
            case UP_ARROW:
            this.moveBlock(this.x, this.y-1, original);
            break;
            case DOWN_ARROW:
            this.moveBlock(this.x, this.y+1, original);
            break;
        }
    }

    this.moveBlock = function(x, y, orig){
        if(x < 0 || x > this.numberOfColumns -1) return;
        if(x < orig.x - this.allowedMoves || x > orig.x + this.allowedMoves) return;

        if(y < 0 || y > this.numberOfColumns -1) return;
        if(y < orig.y - this.allowedMoves || y > orig.y + this.allowedMoves) return;
        
        this.x = x;
        this.y = y;
    }

    this.setColor = function(col){
        this.color = col;
    }
}