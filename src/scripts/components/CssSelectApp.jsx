'use strict';

var React = require('react/addons');
var ReactTransitionGroup = React.addons.TransitionGroup;
var $ = require('jquery');
require('../plugins/spectrum');

// CSS
require('../../styles/normalize.css');
require('../../styles/main.css');
require('../../styles/spectrum.css');

var parseCSS = (function () {
    var open = [], closed = [], cssObject = {}, data = "";

    function exportToJSON(path, callback) {
        $.ajax({
            url: path
        }).done(function (data) {
            //remove comments
            data = data.replace(/\/\*.+?\*\//g, '');

            //get all brackets positions
            getCurlyBracketPosition(data);
            for (var i = 0; i < open.length; i++) {
                convertData(i, data);
            }
            callback(cssObject);
        });
    }

    function getCurlyBracketPosition(data) {
        var lo = open.length;
        var lc = closed.length;

        var nextO = data.indexOf('{', open[lo - 1] + 1 || 0);
        var nextC = data.indexOf('}', closed[lc - 1] + 1 || 0);

        if (nextO !== -1 && nextO < nextC) {
            open.push(nextO);
        } else if (nextC !== -1) {
            closed.push(nextC);
        } else {
            return;
        }
        getCurlyBracketPosition(data);
    }

    function convertData(position, data) {
        var attr = data.slice(closed[position - 1] + 1 || 0, open[position]);
        attr = attr.replace(/(\r\n|\n|\r)/gm, '');
        attr = attr.replace(/^\s+|\s+$/g, '');
        cssObject[attr] = parseProperties(position, data);
    }

    function parseProperties(position, data) {
        var properties = data.slice(open[position] + 1, closed[position]), objProperties = {};
        properties = properties.replace(/(\r\n|\n|\r)/gm, '');

        while (properties.length > 0) {
            var pos = identifyProperties(properties);
            var tempProp = properties.slice(0, pos.sCP);
            var splitProp = tempProp.split(':');
            splitProp[0] = splitProp[0].replace(/^\s+|\s+$/g, '');
            objProperties[splitProp[0]] = splitProp[1].replace(/^\s+|\s+$/g, '');
            properties = properties.replace(tempProp + ';', '');
        }
        return objProperties;
    }

    function identifyProperties(data) {
        var nextC = data.indexOf(':');
        var nnextC = data.indexOf(':', nextC + 1);
        var tempData = data.slice(nextC, nnextC > -1 ? nnextC : data.length);
        var nextSC = tempData.lastIndexOf(';');
        return {cP: nextC, sCP: nextC + nextSC};
    }

    function exportToCSS(data) {
        var css = "";
        for (var key in cssObject) {
            css += key + '{\r\n';
            for (var keyProp in cssObject[key]) {
                css += '\t' + keyProp + ':' + cssObject[key][keyProp] + ';\r\n'
            }
            css += '} \r\n';
        }
        return css;
    }

    return {exportToCSS: exportToCSS, exportToJSON: exportToJSON}
})();

var imageURL = require('../../images/yeoman.png');

var ColorPicker = React.createClass({
    handleChange: function (ev) {
        var attr = ev.getAttribute('data-path').split('__');
        this.props.updateData(attr[0], attr[1], $(ev).val());
    },
    componentDidMount: function () {
        var that = this;
        $(this.getDOMNode()).spectrum({
            preferredFormat: "hex3",
            showInput: true,
            change: function (color) {
                that.handleChange(this);
            }
        });
    },
    render: function () {
        return (
            <input id={this.props.id} defaultValue={this.props.value} onChange={this.handleChange} data-path={this.props.path} />
        )
    }
});

var FontSelect = React.createClass({
    handleChange: function (ev) {
        var attr = ev.getAttribute('data-path').split('__');
        this.props.updateData(attr[0], attr[1], $(ev).val());
    },
    componentDidMount: function () {
    },
    render: function () {
        return (
            <input id={this.props.id} defaultValue={this.props.value} onChange={this.handleChange} data-path={this.props.path} />
        )
    }
});

var CssSelectApp = React.createClass({
    getInitialState: function () {
        return {
            "doWeHaveData": false,
            "colorpicker": [],
            "fontInput": [],
            "ids": {}
        }
    },
    componentWillMount: function () {
        parseCSS.exportToJSON('../../styles/main.css', this.weHaveData);
    },
    weHaveData: function (data) {
        this.generateInputs(data);
        this.setState({"data": data, "doWeHaveData": true});
    },
    updateData: function (classID,property, value) {
        this.state.data[classID][property] = value;
    },
    generateInputs: function (data) {
        for (var key in data) {
            for (var property in data[key]) {
                if (property.indexOf('background') !== -1 || property.indexOf('color') !== -1) {
                    var id = key.replace(/(\.|\s|\,)/g, '') + '_' + property;
                    this.state.ids[id] = data[key][property];
                    this.state.colorpicker.push(<ColorPicker id={id} value={data[key][property]} path={key + '__' + property} updateData={this.updateData} />);
                } else if (property.indexOf('font') !== -1) {
                    var id = key.replace(/(\.|\s|\,)/g, '') + '_' + property;
                    this.state.ids[id] = data[key][property];
                    this.state.fontInput.push(<ColorPicker id={id} value={data[key][property]} path={key + '__' + property} updateData={this.updateData} />);
                }

            }
        }
    },
    componentDidUpdate: function () {
    },
    render: function () {
        return this.state.doWeHaveData ?
            <div className='main'>
                <ReactTransitionGroup transitionName="fade">
                    {this.state.colorpicker}
                </ReactTransitionGroup>
            </div> : null
    }
});

module.exports = CssSelectApp;
