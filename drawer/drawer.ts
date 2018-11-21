
const canvasWidth = 1200, canvasHeight = 1000;
interface ShapeFactory {
    label: string;
    handleMouseDown(x: number, y: number);
    handleMouseUp(x: number, y: number);
    handleMouseMove(x: number, y: number);
}
interface Shape {
    readonly id: number;
    readonly type: string;
    draw(ctx: CanvasRenderingContext2D);
}
class Point2D {
    constructor(readonly x: number, readonly y: number) {}
}
class AbstractShape {
    private static counter: number = 0;
    readonly id: number;
    constructor() {
        this.id = AbstractShape.counter++;
    }
}
abstract class AbstractFactory<T extends Shape> {
    private from: Point2D;
    private tmpTo: Point2D;
    private tmpShape: T;

    constructor(readonly shapeManager: ShapeManager) {}

    abstract createShape(from: Point2D, to: Point2D): T;

    handleMouseDown(x: number, y: number) {
        this.from = new Point2D(x, y);
    }

    handleMouseUp(x: number, y: number) {
        // remove the temp line, if there was one
        if (this.tmpShape) {
            this.shapeManager.removeShapeWithId(this.tmpShape.id, false);
        }
        this.shapeManager.addShape(this.createShape(this.from, new Point2D(x,y)));
        this.from = undefined;

    }

    handleMouseMove(x: number, y: number) {
        // show temp circle only, if the start point is defined;
        if (!this.from) {
            return;
        }
        if (!this.tmpTo || (this.tmpTo.x !== x || this.tmpTo.y !== y)) {
            this.tmpTo = new Point2D(x,y);
            if (this.tmpShape) {
                // remove the old temp line, if there was one
                this.shapeManager.removeShapeWithId(this.tmpShape.id, false);
            }
            // adds a new temp line
            this.tmpShape = this.createShape(this.from, new Point2D(x,y));
            this.shapeManager.addShape(this.tmpShape);
        }
    }

}
class Line extends AbstractShape implements Shape {
    public readonly type: string = "Line";

    constructor(readonly from: Point2D, readonly to: Point2D){
        super();
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.beginPath();
        ctx.moveTo(this.from.x, this.from.y);
        ctx.lineTo(this.to.x, this.to.y);
        ctx.stroke();
    }

}
class LineFactory extends  AbstractFactory<Line> implements ShapeFactory {

    public label: string = "Linie";

    constructor(shapeManager: ShapeManager){
        super(shapeManager);
    }

    createShape(from: Point2D, to: Point2D): Line {
        return new Line(from, to);
    }

}
class Circle extends AbstractShape implements Shape {
    public readonly type: string = "Circle";
    constructor(readonly center: Point2D, readonly radius: number){
        super();
    }
    draw(ctx: CanvasRenderingContext2D) {
        ctx.beginPath();
        ctx.arc(this.center.x,this.center.y,this.radius,0,2*Math.PI);
        ctx.stroke();
    }
}
class CircleFactory extends AbstractFactory<Circle> implements ShapeFactory{
    public label: string = "Kreis";

    constructor(shapeManager: ShapeManager){
        super(shapeManager);
    }

    createShape(from: Point2D, to: Point2D): Circle {
        return new Circle(from, CircleFactory.computeRadius(from, to.x, to.y));
    }

    private static computeRadius(from: Point2D, x: number, y: number): number {
        const xDiff = (from.x - x),
            yDiff = (from.y - y);
        return Math.sqrt(xDiff * xDiff + yDiff * yDiff);
    }
}
class Rectangle extends AbstractShape implements Shape {
    public readonly type: string = "Rectangle";

    constructor(readonly from: Point2D, readonly to: Point2D) {
        super();
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.beginPath();
        ctx.strokeRect(this.from.x, this.from.y,
            this.to.x - this.from.x, this.to.y - this.from.y);
        ctx.stroke();
    }
}
class RectangleFactory extends AbstractFactory<Rectangle> implements ShapeFactory{
    public label: string = "Rechteck";
    constructor(shapeManager: ShapeManager){
        super(shapeManager);
    }

    createShape(from: Point2D, to: Point2D): Rectangle {
        return new Rectangle(from, to);
    }
}
class Triangle extends AbstractShape implements Shape {
    public readonly type: string = "Triangle";

    constructor(readonly p1: Point2D, readonly p2: Point2D, readonly p3: Point2D) {
        super();
    }
    draw(ctx: CanvasRenderingContext2D) {
        ctx.beginPath();
        ctx.moveTo(this.p1.x, this.p1.y);
        ctx.lineTo(this.p2.x, this.p2.y);
        ctx.lineTo(this.p3.x, this.p3.y);
        ctx.lineTo(this.p1.x, this.p1.y);
        ctx.stroke();
    }
}
class TriangleFactory implements ShapeFactory{
    public label: string = "Dreieck";

    private from: Point2D;
    private tmpTo: Point2D;
    private tmpLine: Line;
    private thirdPoint: Point2D;
    private tmpShape: Triangle;

    constructor(readonly shapeManager: ShapeManager) {}

    handleMouseDown(x: number, y: number) {
        if (this.tmpShape) {
            this.shapeManager.removeShapeWithId(this.tmpShape.id, false);
            this.shapeManager.addShape(
                new Triangle(this.from, this.tmpTo, new Point2D(x,y)));
            this.from = undefined;
            this.tmpTo = undefined;
            this.tmpLine = undefined;
            this.thirdPoint = undefined;
            this.tmpShape = undefined;
        } else {
            this.from = new Point2D(x, y);
        }
    }

    handleMouseUp(x: number, y: number) {
        // remove the temp line, if there was one
        if (this.tmpLine) {
            this.shapeManager.removeShapeWithId(this.tmpLine.id, false);
            this.tmpLine = undefined;
            this.tmpTo = new Point2D(x,y);
            this.thirdPoint = new Point2D(x,y);
            this.tmpShape = new Triangle(this.from, this.tmpTo, this.thirdPoint);
            this.shapeManager.addShape(this.tmpShape);
        }
    }

    handleMouseMove(x: number, y: number) {
        // show temp circle only, if the start point is defined;
        if (!this.from) {
            return;
        }

        if (this.tmpShape) { // second point already defined, update temp triangle
            if (!this.thirdPoint || (this.thirdPoint.x !== x || this.thirdPoint.y !== y)) {
                this.thirdPoint = new Point2D(x,y);
                if (this.tmpShape) {
                    // remove the old temp line, if there was one
                    this.shapeManager.removeShapeWithId(this.tmpShape.id, false);
                }
                // adds a new temp triangle
                this.tmpShape = new Triangle(this.from, this.tmpTo, this.thirdPoint);
                this.shapeManager.addShape(this.tmpShape);
            }
        } else { // no second point fixed, update tmp line
            if (!this.tmpTo || (this.tmpTo.x !== x || this.tmpTo.y !== y)) {
                this.tmpTo = new Point2D(x,y);
                if (this.tmpLine) {
                    // remove the old temp line, if there was one
                    this.shapeManager.removeShapeWithId(this.tmpLine.id, false);
                }
                // adds a new temp line
                this.tmpLine = new Line(this.from, this.tmpTo);
                this.shapeManager.addShape(this.tmpLine);
            }
        }
    }
}

class Shapes {
}

interface Pair {
    key: number,
    value: number
}

class myMap {
    private data: Pair[];

    constructor() {
        this.data = [];
    }

    set(key: number, value: number): this {
        for (let pair of this.data) {
            if (pair.key === key) {
                pair.value = value;
                return this;
            }
        }
        this.data.push({
            key: key,
            value: value
        });
        return this;
    }

    has(key: number): boolean {
        for (let pair of this.data) {
            if (pair.key === key) {
                return true;
            }
        }
        return false;
    }

    get(key: number): number {
        for (let pair of this.data) {
            if (pair.key === key) {
                return pair.value;
            }
        }
        return null;
    }

    remove(key: number): number {
        for (let i = 0; i < this.data.length; i++) {
            if (this.data[i].key === key) {
                let tmp: number = this.data[i].value;
                this.data.splice(i, 1);
                return tmp;
            }
        }
    }

    length(): number {
        return this.data.length;
    }
}
class ToolArea {
    private selectedShape: ShapeFactory = undefined;
    constructor(shapesSelector: ShapeFactory[], menue: Element) {
        const domElms = [];
        shapesSelector.forEach(sl => {
            const domSelElement = document.createElement("li");
            domSelElement.innerText = sl.label;
            menue.appendChild(domSelElement);
            domElms.push(domSelElement);

            domSelElement.addEventListener("click", () => {
                selectFactory.call(this, sl, domSelElement);
            });
        });

        function selectFactory(sl: ShapeFactory, domElm: HTMLElement) {
            // remove class from all elements
            for (let j = 0; j < domElms.length; j++) {
                domElms[j].classList.remove("marked");
            }
            this.selectedShape = sl;
            // add class to the one that is selected currently
            domElm.classList.add("marked");
        }
    }

    getSelectedShape(): ShapeFactory {
        return this.selectedShape;
    }

}

interface ShapeManager {
    addShape(shape: Shape, redraw?: boolean): this;
    removeShape(shape: Shape, redraw?: boolean): this;
    removeShapeWithId(id: number, redraw?: boolean): this;
}
interface Commands {
    command: string,
    shape?: Shape,
    shapeId?: number,
    redraw: boolean
}
class Canvas {
    private ctx: CanvasRenderingContext2D;
    private shapes: {[p: number]: Shape} = {};
    private commands: Commands[] = [];
    private ids: myMap;

    constructor(canvasDomElement: HTMLCanvasElement,
                toolarea: ToolArea) {
        this.ctx = canvasDomElement.getContext("2d");
        canvasDomElement.addEventListener("mousemove",
            createMouseHandler("handleMouseMove"));
        canvasDomElement.addEventListener("mousedown",
            createMouseHandler("handleMouseDown"));
        canvasDomElement.addEventListener("mouseup",
            createMouseHandler("handleMouseUp"));
        this.ctx.save();
        this.ids = new myMap();

        function createMouseHandler(methodName: string) {
            return function (e) {
                e = e || window.event;

                if ('object' === typeof e) {
                    const btnCode = e.button,
                        x = e.pageX - this.offsetLeft,
                        y = e.pageY - this.offsetTop,
                        ss = toolarea.getSelectedShape();
                    // if left mouse button is pressed,
                    // and if a tool is selected, do something
                    if (e.button === 0 && ss) {
                        const m = ss[methodName];
                        // This in the shapeFactory should be the factory itself.
                        m.call(ss, x, y);
                    }
                }
            }
        }
    }

    draw(): this {
        // TODO: it there a better way to reset the canvas?
        this.ctx.beginPath();
        this.ctx.fillStyle = 'lightgrey';
        this.ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        this.ctx.stroke();

        // draw shapes
        this.ctx.fillStyle = 'black';
        for (let id in this.shapes) {
            this.shapes[id].draw(this.ctx);
        }
        return this;
    }

    private addShape(shape: Shape, redraw: boolean = true): this {
        this.shapes[shape.id] = shape;
        return redraw ? this.draw() : this;
    }

    removeShape(shape: Shape, redraw: boolean = true): this {
        delete  this.shapes[shape.id];
        return redraw ? this.draw() : this;
    }

    removeShapeWithId(id: number, redraw: boolean = true): this {
        delete  this.shapes[id];
        return redraw ? this.draw() : this;
    }

    executeCommand(command: Commands): this {
        if (command.command === "addShape") {
            // turns off type check for shape, it comes from JSON.parse
            if (command.shape.draw === undefined){
                const oldId : number = command.shape.id;
                const shapeUntyped: any = command.shape;
                if (command.shape.type === "Line") {
                    command.shape = new Line(shapeUntyped.from, shapeUntyped.to);
                } else if (command.shape.type === "Triangle") {
                    command.shape = new Triangle(shapeUntyped.p1, shapeUntyped.p2, shapeUntyped.p3);
                } else if(command.shape.type === "Rectangle"){
                    command.shape = new Rectangle(shapeUntyped.from, shapeUntyped.to)
                } else if(command.shape.type === "Circle"){
                   command.shape = new Circle(shapeUntyped.from, shapeUntyped.to)
                }
                this.ids.set(oldId, command.shape.id);
            }
            this.addShape(command.shape, command.redraw);
        } else if (command.command === "removeShape") {
                if(this.ids.has(command.shape.id)){
                    const newId = this.ids.remove(command.shape.id);
                    this.removeShapeWithId(newId, command.redraw);
                }
                else
                    this.removeShape(command.shape, command.redraw);


        } else if (command.command === "removeShapeWithId") {
            let id;
            if(this.ids.has(command.shapeId)){
                id = this.ids.remove(command.shapeId);
            }else
                id = command.shapeId;
            this.removeShapeWithId(id, command.redraw);
        }
        const tf: HTMLTextAreaElement = document.getElementById("eventsAsText") as HTMLTextAreaElement;
        this.commands.push(command);
        tf.value = JSON.stringify(this.commands);
        return this;
    }

    reset(){
        this.ctx.clearRect(0,0, canvasWidth,canvasHeight);
    }
}

function init() {
    const canvasDomElm = document.getElementById("drawArea") as HTMLCanvasElement;
    const menu = document.getElementsByClassName("tools");
    // Problem here: Factories needs a way to create new Shapes, so they
    // have to call a method of the canvas.
    // The canvas on the other side wants to call the event methods
    // on the toolbar, because the toolbar knows what tool is currently
    // selected.
    // Anyway, we do not want the two to have references on each other
    let canvas: Canvas;
    const sm: ShapeManager = {
        addShape(s, r) {
            canvas.executeCommand({
                command: "addShape",
                shape: s,
                redraw: r
            });
            return sm;
        },
        removeShape(s,rd) {
            canvas.executeCommand({
                command: "removeShape",
                shape: s,
                redraw: rd
            });
            return sm;
        },
        removeShapeWithId(id, rd) {
            canvas.executeCommand({
                command: "removeShapeWithId",
                shapeId: id,
                redraw: rd
            });
            return sm;
        }
    };
    const shapesSelector: ShapeFactory[] = [
        new LineFactory(sm),
        new CircleFactory(sm),
        new RectangleFactory(sm),
        new TriangleFactory(sm)
    ];
    const toolArea = new ToolArea(shapesSelector, menu[0]);
    canvas = new Canvas(canvasDomElm, toolArea);
    canvas.draw();

    const lBnt = document.getElementById("loadButton");
    lBnt.innerText = "load"
    lBnt.addEventListener("click", () => {
        const tf: HTMLTextAreaElement = document.getElementById("eventsAsText") as HTMLTextAreaElement;
        const tvalue = tf.value;
        const events = JSON.parse(tvalue);

        for (let eventsKey in events) {
            canvas.executeCommand(events[eventsKey]);
        }
        console.log(events);
    });

    const rbnt = document.getElementById("resetButton");
    rbnt.innerText = "reset";
    rbnt.addEventListener("click", () => {
        canvas.reset();
    });


}
