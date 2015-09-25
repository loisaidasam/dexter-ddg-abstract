
var request = require('request');

function parseDDGResponse(data) {
    var topic;
    if (data.AbstractText) {
        // hubot abs numerology
        // Numerology is any study of the purported mystical relationship between a count or measurement and life.
        // http://en.wikipedia.org/wiki/Numerology
        return {
            'text': data.AbstractText,
            'url': data.AbstractURL,
        };
    }
    if (data.RelatedTopics && data.RelatedTopics.length) {
        topic = data.RelatedTopics[0];
    }
    if (topic && ! /\/c\//.test(topic.FirstURL)) {
        // hubot abs astronomy
        // Astronomy is the scientific study of celestial objects.
        // http://duckduckgo.com/Astronomy
        return {
            'text': topic.Text,
            'url': topic.FirstURL,
        };
    }
    if (data.Definition) {
        // hubot abs contumacious
        // contumacious definition: stubbornly disobedient.
        // http://merriam-webster.com/dictionary/contumacious
        return {
            'text': data.Definition,
            'url': data.DefinitionURL,
        };
    }
}

module.exports = {
    /**
     * Abstract function using Duck Duck Go's API
     *
     * Based on Hubot script:
     * https://github.com/github/hubot-scripts/blob/88649da75ff8fc8af36b7e07c3dcd0a03faa1d45/src/scripts/abstract.coffee
     *
     * @param {AppStep} step Accessor for the configuration for the step using this module.  Use step.input('{key}') to retrieve input data.
     * @param {AppData} dexter Container for all data used in this workflow.
     */
    run: function(step, dexter) {
        var input = step.input('input')[0];
        this.log("input: " + input);
        var uri_component = encodeURIComponent(input);
        this.log("uri_component: " + uri_component);
        var url = "http://api.duckduckgo.com/?format=json&q=" + uri_component;
        this.log("Abstract URL: " + url);
        var self = this;
        request(url, function (error, response, body) {
            if (error) {
                return self.fail("Error with web request");
            }
            if (response.statusCode != 200) {
                return self.fail("Invalid response code: " + response.statusCode);
            }
            var data = JSON.parse(body.toString("utf8"));
            if (! data) {
                return self.fail("Invalid response data");
            }
            result = parseDDGResponse(data);
            if (! result) {
                return self.fail("I don't know anything about that.");
            }
            result['input'] = input;
            self.complete(result);
        });
    }
};
