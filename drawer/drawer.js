var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    }
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var canvasWidth = 1200, canvasHeight = 1000;
var Point2D = /** @class */ (function () {
    function Point2D(x, y) {
        this.x = x;
        this.y = y;
    }
    return Point2D;
}());
var AbstractShape = /** @class */ (function () {
    function AbstractShape() {
        this.id = AbstractShape.counter++;
    }
    AbstractShape.counter = 0;
    return AbstractShape;
}());
var AbstractFactory = /** @class */ (function () {
    function AbstractFactory(shapeManager) {
        this.shapeManager = shapeManager;
    }
    AbstractFactory.prototype.handleMouseDown = function (x, y) {
        this.from = new Point2D(x, y);
    };
    AbstractFactory.prototype.handleMouseUp = function (x, y) {
        // remove the temp line, if there was one
        if (this.tmpShape) {
            this.shapeManager.removeShapeWithId(this.tmpShape.id, false);
        }
        this.shapeManager.addShape(this.createShape(this.from, new Point2D(x, y)));
        this.from = undefined;
    };
    AbstractFactory.prototype.handleMouseMove = function (x, y) {
        // show temp circle only, if the start point is defined;
        if (!this.from) {
            return;
        }
        if (!this.tmpTo || (this.tmpTo.x !== x || this.tmpTo.y !== y)) {
            this.tmpTo = new Point2D(x, y);
            if (this.tmpShape) {
                // remove the old temp line, if there was one
                this.shapeManager.removeShapeWithId(this.tmpShape.id, false);
            }
            // adds a new temp line
            this.tmpShape = this.createShape(this.from, new Point2D(x, y));
            this.shapeManager.addShape(this.tmpShape);
        }
    };
    return AbstractFactory;
}());
var Line = /** @class */ (function (_super) {
    __extends(Line, _super);
    function Line(from, to) {
        var _this = _super.call(this) || this;
        _this.from = from;
        _this.to = to;
        _this.type = "Line";
        return _this;
    }
    Line.prototype.draw = function (ctx) {
        ctx.beginPath();
        ctx.moveTo(this.from.x, this.from.y);
        ctx.lineTo(this.to.x, this.to.y);
        ctx.stroke();
    };
    return Line;
}(AbstractShape));
var LineFactory = /** @class */ (function (_super) {
    __extends(LineFactory, _super);
    function LineFactory(shapeManager) {
        var _this = _super.call(this, shapeManager) || this;
        _this.label = "Linie";
        return _this;
    }
    LineFactory.prototype.createShape = function (from, to) {
        return new Line(from, to);
    };
    return LineFactory;
}(AbstractFactory));
var Circle = /** @class */ (function (_super) {
    __extends(Circle, _super);
    function Circle(center, radius) {
        var _this = _super.call(this) || this;
        _this.center = center;
        _this.radius = radius;
        _this.type = "Circle";
        return _this;
    }
    Circle.prototype.draw = function (ctx) {
        ctx.beginPath();
        ctx.arc(this.center.x, this.center.y, this.radius, 0, 2 * Math.PI);
        ctx.stroke();
    };
    return Circle;
}(AbstractShape));
var CircleFactory = /** @class */ (function (_super) {
    __extends(CircleFactory, _super);
    function CircleFactory(shapeManager) {
        var _this = _super.call(this, shapeManager) || this;
        _this.label = "Kreis";
        return _this;
    }
    CircleFactory.prototype.createShape = function (from, to) {
        return new Circle(from, CircleFactory.computeRadius(from, to.x, to.y));
    };
    CircleFactory.computeRadius = function (from, x, y) {
        var xDiff = (from.x - x), yDiff = (from.y - y);
        return Math.sqrt(xDiff * xDiff + yDiff * yDiff);
    };
    return CircleFactory;
}(AbstractFactory));
var Rectangle = /** @class */ (function (_super) {
    __extends(Rectangle, _super);
    function Rectangle(from, to) {
        var _this = _super.call(this) || this;
        _this.from = from;
        _this.to = to;
        _this.type = "Rectangle";
        return _this;
    }
    Rectangle.prototype.draw = function (ctx) {
        ctx.beginPath();
        ctx.strokeRect(this.from.x, this.from.y, this.to.x - this.from.x, this.to.y - this.from.y);
        ctx.stroke();
    };
    return Rectangle;
}(AbstractShape));
var RectangleFactory = /** @class */ (function (_super) {
    __extends(RectangleFactory, _super);
    function RectangleFactory(shapeManager) {
        var _this = _super.call(this, shapeManager) || this;
        _this.label = "Rechteck";
        return _this;
    }
    RectangleFactory.prototype.createShape = function (from, to) {
        return new Rectangle(from, to);
    };
    return RectangleFactory;
}(AbstractFactory));
var Triangle = /** @class */ (function (_super) {
    __extends(Triangle, _super);
    function Triangle(p1, p2, p3) {
        var _this = _super.call(this) || this;
        _this.p1 = p1;
        _this.p2 = p2;
        _this.p3 = p3;
        _this.type = "Triangle";
        return _this;
    }
    Triangle.prototype.draw = function (ctx) {
        ctx.beginPath();
        ctx.moveTo(this.p1.x, this.p1.y);
        ctx.lineTo(this.p2.x, this.p2.y);
        ctx.lineTo(this.p3.x, this.p3.y);
        ctx.lineTo(this.p1.x, this.p1.y);
        ctx.stroke();
    };
    return Triangle;
}(AbstractShape));
var TriangleFactory = /** @class */ (function () {
    function TriangleFactory(shapeManager) {
        this.shapeManager = shapeManager;
        this.label = "Dreieck";
    }
    TriangleFactory.prototype.handleMouseDown = function (x, y) {
        if (this.tmpShape) {
            this.shapeManager.removeShapeWithId(this.tmpShape.id, false);
            this.shapeManager.addShape(new Triangle(this.from, this.tmpTo, new Point2D(x, y)));
            this.from = undefined;
            this.tmpTo = undefined;
            this.tmpLine = undefined;
            this.thirdPoint = undefined;
            this.tmpShape = undefined;
        }
        else {
            this.from = new Point2D(x, y);
        }
    };
    TriangleFactory.prototype.handleMouseUp = function (x, y) {
        // remove the temp line, if there was one
        if (this.tmpLine) {
            this.shapeManager.removeShapeWithId(this.tmpLine.id, false);
            this.tmpLine = undefined;
            this.tmpTo = new Point2D(x, y);
            this.thirdPoint = new Point2D(x, y);
            this.tmpShape = new Triangle(this.from, this.tmpTo, this.thirdPoint);
            this.shapeManager.addShape(this.tmpShape);
        }
    };
    TriangleFactory.prototype.handleMouseMove = function (x, y) {
        // show temp circle only, if the start point is defined;
        if (!this.from) {
            return;
        }
        if (this.tmpShape) { // second point already defined, update temp triangle
            if (!this.thirdPoint || (this.thirdPoint.x !== x || this.thirdPoint.y !== y)) {
                this.thirdPoint = new Point2D(x, y);
                if (this.tmpShape) {
                    // remove the old temp line, if there was one
                    this.shapeManager.removeShapeWithId(this.tmpShape.id, false);
                }
                // adds a new temp triangle
                this.tmpShape = new Triangle(this.from, this.tmpTo, this.thirdPoint);
                this.shapeManager.addShape(this.tmpShape);
            }
        }
        else { // no second point fixed, update tmp line
            if (!this.tmpTo || (this.tmpTo.x !== x || this.tmpTo.y !== y)) {
                this.tmpTo = new Point2D(x, y);
                if (this.tmpLine) {
                    // remove the old temp line, if there was one
                    this.shapeManager.removeShapeWithId(this.tmpLine.id, false);
                }
                // adds a new temp line
                this.tmpLine = new Line(this.from, this.tmpTo);
                this.shapeManager.addShape(this.tmpLine);
            }
        }
    };
    return TriangleFactory;
}());
var Shapes = /** @class */ (function () {
    function Shapes() {
    }
    return Shapes;
}());
var myMap = /** @class */ (function () {
    function myMap() {
        this.data = [];
    }
    myMap.prototype.set = function (key, value) {
        for (var _i = 0, _a = this.data; _i < _a.length; _i++) {
            var pair = _a[_i];
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
    };
    myMap.prototype.has = function (key) {
        for (var _i = 0, _a = this.data; _i < _a.length; _i++) {
            var pair = _a[_i];
            if (pair.key === key) {
                return true;
            }
        }
        return false;
    };
    myMap.prototype.get = function (key) {
        for (var _i = 0, _a = this.data; _i < _a.length; _i++) {
            var pair = _a[_i];
            if (pair.key === key) {
                return pair.value;
            }
        }
        return null;
    };
    myMap.prototype.remove = function (key) {
        for (var i = 0; i < this.data.length; i++) {
            if (this.data[i].key === key) {
                var tmp = this.data[i].value;
                this.data.splice(i, 1);
                return tmp;
            }
        }
    };
    myMap.prototype.length = function () {
        return this.data.length;
    };
    return myMap;
}());
var ToolArea = /** @class */ (function () {
    function ToolArea(shapesSelector, menue) {
        var _this = this;
        this.selectedShape = undefined;
        var domElms = [];
        shapesSelector.forEach(function (sl) {
            var domSelElement = document.createElement("li");
            domSelElement.innerText = sl.label;
            menue.appendChild(domSelElement);
            domElms.push(domSelElement);
            domSelElement.addEventListener("click", function () {
                selectFactory.call(_this, sl, domSelElement);
            });
        });
        function selectFactory(sl, domElm) {
            // remove class from all elements
            for (var j = 0; j < domElms.length; j++) {
                domElms[j].classList.remove("marked");
            }
            this.selectedShape = sl;
            // add class to the one that is selected currently
            domElm.classList.add("marked");
        }
    }
    ToolArea.prototype.getSelectedShape = function () {
        return this.selectedShape;
    };
    return ToolArea;
}());
var Canvas = /** @class */ (function () {
    function Canvas(canvasDomElement, toolarea) {
        this.shapes = {};
        this.commands = [];
        this.ctx = canvasDomElement.getContext("2d");
        canvasDomElement.addEventListener("mousemove", createMouseHandler("handleMouseMove"));
        canvasDomElement.addEventListener("mousedown", createMouseHandler("handleMouseDown"));
        canvasDomElement.addEventListener("mouseup", createMouseHandler("handleMouseUp"));
        this.ctx.save();
        this.ids = new myMap();
        function createMouseHandler(methodName) {
            return function (e) {
                e = e || window.event;
                if ('object' === typeof e) {
                    var btnCode = e.button, x = e.pageX - this.offsetLeft, y = e.pageY - this.offsetTop, ss = toolarea.getSelectedShape();
                    // if left mouse button is pressed,
                    // and if a tool is selected, do something
                    if (e.button === 0 && ss) {
                        var m = ss[methodName];
                        // This in the shapeFactory should be the factory itself.
                        m.call(ss, x, y);
                    }
                }
            };
        }
    }
    Canvas.prototype.draw = function () {
        // TODO: it there a better way to reset the canvas?
        this.ctx.beginPath();
        this.ctx.fillStyle = 'lightgrey';
        this.ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        this.ctx.stroke();
        // draw shapes
        this.ctx.fillStyle = 'black';
        for (var id in this.shapes) {
            this.shapes[id].draw(this.ctx);
        }
        return this;
    };
    Canvas.prototype.addShape = function (shape, redraw) {
        if (redraw === void 0) { redraw = true; }
        this.shapes[shape.id] = shape;
        return redraw ? this.draw() : this;
    };
    Canvas.prototype.removeShape = function (shape, redraw) {
        if (redraw === void 0) { redraw = true; }
        delete this.shapes[shape.id];
        return redraw ? this.draw() : this;
    };
    Canvas.prototype.removeShapeWithId = function (id, redraw) {
        if (redraw === void 0) { redraw = true; }
        delete this.shapes[id];
        return redraw ? this.draw() : this;
    };
    Canvas.prototype.executeCommand = function (command) {
        if (command.command === "addShape") {
            // turns off type check for shape, it comes from JSON.parse
            if (command.shape.draw === undefined) {
                var oldId = command.shape.id;
                var shapeUntyped = command.shape;
                if (command.shape.type === "Line") {
                    command.shape = new Line(shapeUntyped.from, shapeUntyped.to);
                }
                else if (command.shape.type === "Triangle") {
                    command.shape = new Triangle(shapeUntyped.p1, shapeUntyped.p2, shapeUntyped.p3);
                }
                else if (command.shape.type === "Rectangle") {
                    command.shape = new Rectangle(shapeUntyped.from, shapeUntyped.to);
                }
                else if (command.shape.type === "Circle") {
                    command.shape = new Circle(shapeUntyped.from, shapeUntyped.to);
                }
                this.ids.set(oldId, command.shape.id);
            }
            this.addShape(command.shape, command.redraw);
        }
        else if (command.command === "removeShape") {
            if (this.ids.has(command.shape.id)) {
                var newId = this.ids.remove(command.shape.id);
                this.removeShapeWithId(newId, command.redraw);
            }
            else
                this.removeShape(command.shape, command.redraw);
        }
        else if (command.command === "removeShapeWithId") {
            var id = void 0;
            if (this.ids.has(command.shapeId)) {
                id = this.ids.remove(command.shapeId);
            }
            else
                id = command.shapeId;
            this.removeShapeWithId(id, command.redraw);
        }
        var tf = document.getElementById("eventsAsText");
        this.commands.push(command);
        tf.value = JSON.stringify(this.commands);
        return this;
    };
    Canvas.prototype.reset = function () {
        this.ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    };
    return Canvas;
}());
function init() {
    var canvasDomElm = document.getElementById("drawArea");
    var menu = document.getElementsByClassName("tools");
    // Problem here: Factories needs a way to create new Shapes, so they
    // have to call a method of the canvas.
    // The canvas on the other side wants to call the event methods
    // on the toolbar, because the toolbar knows what tool is currently
    // selected.
    // Anyway, we do not want the two to have references on each other
    var canvas;
    var sm = {
        addShape: function (s, r) {
            canvas.executeCommand({
                command: "addShape",
                shape: s,
                redraw: r
            });
            return sm;
        },
        removeShape: function (s, rd) {
            canvas.executeCommand({
                command: "removeShape",
                shape: s,
                redraw: rd
            });
            return sm;
        },
        removeShapeWithId: function (id, rd) {
            canvas.executeCommand({
                command: "removeShapeWithId",
                shapeId: id,
                redraw: rd
            });
            return sm;
        }
    };
    var shapesSelector = [
        new LineFactory(sm),
        new CircleFactory(sm),
        new RectangleFactory(sm),
        new TriangleFactory(sm)
    ];
    var toolArea = new ToolArea(shapesSelector, menu[0]);
    canvas = new Canvas(canvasDomElm, toolArea);
    canvas.draw();
    var lBnt = document.getElementById("loadButton");
    lBnt.innerText = "load";
    lBnt.addEventListener("click", function () {
        var tf = document.getElementById("eventsAsText");
        var tvalue = tf.value;
        var events = JSON.parse(tvalue);
        for (var eventsKey in events) {
            canvas.executeCommand(events[eventsKey]);
        }
        console.log(events);
    });
    var rbnt = document.getElementById("resetButton");
    rbnt.innerText = "reset";
    rbnt.addEventListener("click", function () {
        canvas.reset();
    });
}
