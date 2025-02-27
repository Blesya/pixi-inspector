export const blacklist = [
  "children",
  "parent",
  "tempDisplayObjectParent",
  "scope"
];
export const whitelist = [
  "transform",
  "position",
  "scale",
  "rotation",
  "pivot",
  "skew",
  "anchor"
];

export const needToShow =
[
  "_action",
  "_enabled",
  "_format",
  "_height",
  "_label",
  "_labelFormat",
  "_skin",
  "_state",
  "_style",
  "_theme",
  "_width",
  "name",
  "visible",
  "_x",
  "_y",

  //label
  "_realLabel",
  "_bold",
  "_color",
  "_fontName",
  "_fontSize",
  "_format",
  "_hAlign",
  "_hint",
  "_italic",
  "_lowercase",
  "_uppercase",
  "_vAlign"
]

class MismatchConstructor {}

export default class InspectorProperties {
  constructor(inspector) {
    const PIXI = inspector.instance.PIXI;
    this.TransformRef = MismatchConstructor;
    if (typeof PIXI.Transform === "function") {
      this.TransformRef = PIXI.Transform;
    } else if (typeof PIXI.TransformBase === "function") {
      this.TransformRef = PIXI.Transform;
    }
    this.ObservablePointRef =
      typeof PIXI.ObservablePoint === "function"
        ? PIXI.ObservablePoint
        : MismatchConstructor;
    // this.Point = PIXI.Point
  }

  all() {
    if (!window.$pixi) {
      return [];
    }
    const properties = [];
    for (const property in window.$pixi) {
      if (needToShow.indexOf(property) !== -1) {
        properties.push(...this.serialize(window.$pixi[property], [property], 3));
      }
    }
    properties.sort((a, b) => (a.path > b.path ? 1 : -1));
    return properties;
  }
  /* eslint-disable */
  set(path, value) {
    eval("$pixi." + path + " = " + JSON.stringify(value));

    if (path === "_width" || path === "_height")
      $pixi.drawLayout()

    if ($pixi._textHTML)
      $pixi._textHTML = "";
    $pixi.invalidateComplexLabel();
    $pixi.invalidateProperties();
    $pixi.drawStyles();
    $pixi.drawProperties();
  }

  allInterfaces() {
    if (!window.$pixi) {
      return [];
    }
    const properties = [];
    for (const property in window.$pixi) {
      if (property[0] === "I") {
        properties.push(...this.serialize(window.$pixi[property], [property], 3));
      }
    }
    properties.sort((a, b) => (a.path > b.path ? 1 : -1));
    return properties;
  }

  /* eslint-enable */

  serialize(value, path, depth) {
    depth--;
    if (depth < 0) {
      return [];
    }
    const type = typeof value;
    if (type === "undefined" || type === "function") {
      return [];
    } else if (
      type === "string" ||
      type === "number" ||
      type === "boolean" ||
      value === null
    ) {
      return [{ path: path.join("."), type, value }];
    } else if (type === "object") {
      if (value === null) {
        return [{ path: path.join("."), type, value }];
      }
      if (Array.isArray(value)) {
        return [{ path: path.join("."), type: "Array" }];
      }
      if (whitelist.indexOf(path[path.length - 1]) !== -1) {
        const properties = [];
        for (const property in value) {
          if (blacklist.indexOf(property) !== -1) {
            continue;
          }
          if (property[0] === "_") {
            continue;
          }
          properties.push(
            ...this.serialize(value[property], [...path, property], depth)
          );
        }
        if (value instanceof this.ObservablePointRef) {
          properties.push(
            {
              path: path.join(".") + ".x",
              type: "number",
              value: value.x
            },
            {
              path: path.join(".") + ".y",
              type: "number",
              value: value.y
            }
          );
        }
        if (value instanceof this.TransformRef) {
          properties.push({
            path: path.join(".") + ".rotation",
            type: "number",
            value: value.rotation
          });
        }
        if (properties.length !== 0) {
          return properties;
        }
      }
      // (typeof value.constructor ? (value.constructor.name || type) : type
      return [{ path: path.join("."), type: "Object" }];
    }
    return [
      {
        path: path.join("."),
        type:
          typeof value.constructor !== "undefined"
            ? value.constructor.name || type
            : type
      }
    ];
  }
}
