/*
 *  The MIT License (MIT)
 *
 * Copyright (c) 2016-2017 The Regents of the University of California
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and
 * associated documentation files (the "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the
 * following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial
 * portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING
 * BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,  FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
 * CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
 * ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *
 */
var app = (function (app) {

    app.init = function ($container, appConfig) {

        igv
            .createBrowser($container.get(0), igvConfigurator())
            .then(function (browser) {
                var trackLoadConfig,
                    shareConfig;

                // Track load controller configuration
                trackLoadConfig =
                    {
                        $fileModal: $('#igv-app-track-from-file-or-url-modal'),
                        $urlModal: $('#igv-app-track-from-url-modal'),
                        $encodeModal: $('#igv-app-encode-modal'),
                        $encodeModalPresentationButton: $('#igv-encode-list-item-button')
                    };

                app.trackLoadController = new app.TrackLoadController(browser, trackLoadConfig);


                // Genome Modal Controller
                app.genomeModalController = new app.GenomeModalController(browser, $('#igv-app-genome-from-file-or-url-modal'));

                // Genome Controller
                app.genomeController = new app.GenomeController();

                app.genomeController.getGenomes(app.GenomeController.defaultGenomeURL)
                    .then(function (genomeDictionary) {
                        var config;

                        config =
                            {
                                browser: browser,
                                $modal: $('#igv-app-genome-from-file-or-url-modal'),
                                $dropdown_menu: $('#igv-app-genome-dropdown').find('.dropdown-menu'),
                                genomeDictionary: genomeDictionary
                            };

                        genomeDropdownLayout(config);
                    });

                // URL Shortener Configuration
                if (appConfig.urlShortener) {

                    app.setURLShortener(appConfig.urlShortener);

                    shareConfig =
                        {
                            $modal: $('#hic-share-modal'),
                            $share_input: $('#hic-share-input'),
                            $copy_link_button: $('#hic-copy-link-button'),
                            $tweet_button_container: $('#hic-tweet-button-container'),
                            $email_button: $('#hic-email-button'),
                            $embed_button: $('#hic-embed-button'),
                            $qrcode_button: $('#hic-qrcode-button'),
                            $embed_container: $('#hic-embed-container'),
                            $qrcode_image: $('#hic-qrcode-image')
                        };

                    app.shareController = new app.ShareController($container, browser, shareConfig);

                } else {
                    $("#hic-share-button").hide();
                }

            });


    };

    function genomeDropdownLayout(config) {

        var $divider,
            $button,
            keys;

        config.$dropdown_menu.empty();

        keys = Object.keys(config.genomeDictionary);

        keys.forEach(function (jsonID) {

            $button = createButton(jsonID);
            config.$dropdown_menu.append($button);

            $button.on('click', function () {
                var key,
                    genome;

                key = $(this).text();

                genome = config.genomeDictionary[ key ];

                config.browser.loadGenome(genome);
                app.trackLoadController.createEncodeTable(genome.id);
            });

        });

        // menu divider
        $divider  = $('<div>', { class:'dropdown-divider' });
        config.$dropdown_menu.append($divider);

        // genome from file or url button
        $button = createButton('file or url ...');
        config.$dropdown_menu.append($button);
        $button.on('click', function () {
            config.$modal.modal();
        });

    }

    function createButton (title) {
        var $button;

        $button = $('<button>', { class:'dropdown-item', type:'button' });
        $button.text(title);

        return $button;
    }

    function igvConfigurator() {
        var configuration;

        configuration =
            {
                queryParametersSupported: true,
                fileLoadWidget:
                    {
                        hidden: false,
                        embed: true,
                        $widgetParent: $('#igv-app-track-from-file-or-url-modal').find('.modal-body')
                    },
                showChromosomeWidget:true,
                promisified:true,
                minimumBases: 6,
                showIdeogram: true,
                showRuler: true,
                // locus: 'myc',
                // // locus: 'brca1',
                // // locus: 'SLC25A3',
                // // locus: 'rs28372744',
                // // locus: ['egfr', 'myc', 'pten'],
                // // locus: ['2', '4', '8'],
                reference:
                    {
                        id: "hg19",
                        fastaURL: "https://s3.amazonaws.com/igv.broadinstitute.org/genomes/seq/1kg_v37/human_g1k_v37_decoy.fasta",
                        cytobandURL: "https://s3.amazonaws.com/igv.broadinstitute.org/genomes/seq/b37/b37_cytoband.txt",
                        tracks:
                            [
                                {
                                    name: "Genes",
                                    searchable: false,
                                    type: "annotation",
                                    format: "gtf",
                                    sourceType: "file",
                                    url: "https://s3.amazonaws.com/igv.broadinstitute.org/annotations/hg19/genes/gencode.v18.annotation.sorted.gtf.gz",
                                    indexURL: "https://s3.amazonaws.com/igv.broadinstitute.org/annotations/hg19/genes/gencode.v18.annotation.sorted.gtf.gz.tbi",
                                    visibilityWindow: 10000000,
                                    order: Number.MAX_VALUE,
                                    displayMode: "EXPANDED"
                                }
                            ]
                    }
                // flanking: 75000,
                // search: {
                //     url: "https://dev.gtexportal.org/rest/v1/reference/features/$FEATURE$",
                //     resultsField: "features"
                // },
                // apiKey: 'AIzaSyDUUAUFpQEN4mumeMNIRWXSiTh5cPtUAD0',
                // palette:
                //     [
                //         "#00A0B0",
                //         "#6A4A3C",
                //         "#CC333F",
                //         "#EB6841"
                //     ],
                // tracks:
                //     [
                //         {
                //             name: "Genes",
                //             searchable: false,
                //             type: "annotation",
                //             format: "gtf",
                //             sourceType: "file",
                //             url: "https://s3.amazonaws.com/igv.broadinstitute.org/annotations/hg19/genes/gencode.v18.annotation.sorted.gtf.gz",
                //             indexURL: "https://s3.amazonaws.com/igv.broadinstitute.org/annotations/hg19/genes/gencode.v18.annotation.sorted.gtf.gz.tbi",
                //             visibilityWindow: 10000000,
                //             order: Number.MAX_VALUE,
                //             displayMode: "EXPANDED"
                //         }
                //     ]
            };

        return configuration;
    }


    return app;

})(app || {});