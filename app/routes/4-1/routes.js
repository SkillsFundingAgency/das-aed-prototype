

module.exports = function (router,_myData) {
    const config = require('./../../../app/config.js')
    var version = "4-1";

    //Sort standards
    function sortStandards(req, _sortBy){
        req.session.myData.standards.list.sort(function(a,b){

            var returnValue = 0;

            // RELEVANCE
            if(_sortBy == "searchrelevance"){
                if (a.searchrelevance == b.searchrelevance){
                    // NAME 
                    sortByName()
                } else if (a.searchrelevance > b.searchrelevance){
                    returnValue = -1
                } else if(a.searchrelevance < b.searchrelevance){
                    returnValue = 1
                }
            } else {
                // NAME
                sortByName()
            }

            function sortByName(){
                if (a.title.toUpperCase() < b.title.toUpperCase()){
                    returnValue = -1
                } else if(a.title.toUpperCase() > b.title.toUpperCase()){
                    returnValue = 1
                }
            }

            return returnValue

        });
    }
    //Sort providers
    function sortProviders(req, _sortBy){
        if(_sortBy == "distance"){
            req.session.myData["providers-new"].list.sort(function(a,b){
                return a.distance - b.distance
            });
        } else {
            req.session.myData["providers-new"].list.sort(function(a,b){
                var returnValue = 0;
                if (a.name.toUpperCase() < b.name.toUpperCase()){
                    returnValue = -1
                } else if(a.name.toUpperCase() > b.name.toUpperCase()){
                    returnValue = 1
                }
                return returnValue
            });
        }
    }
    //Sort epaos
    function sortEPAOs(req, _sortBy){
        if(_sortBy == "distance"){
            req.session.myData.epaos.list.sort(function(a,b){
                return a.distance - b.distance
            });
        } else {
            req.session.myData.epaos.list.sort(function(a,b){
                var returnValue = 0;
                if (a.name.toUpperCase() < b.name.toUpperCase()){
                    returnValue = -1
                } else if(a.name.toUpperCase() > b.name.toUpperCase()){
                    returnValue = 1
                }
                return returnValue
            });
        }
    }

    // For back links
    function getRefererPage(referer){
        if(referer) {
            var urlArray = referer.split('/'),
                pageLoc = urlArray.length-1,
                refPage = urlArray[pageLoc];
            return refPage
        } else {
            return ""
        }
    }

    // Location filtering
    function cityMatch(req){
        var _match = false
        for (var i = 0; i < req.session.myData.citiesAutocompleteList.length; i++) {
            var _thisCity = req.session.myData.citiesAutocompleteList[i]
            if(req.session.myData.locationTemp.toUpperCase() == _thisCity.toUpperCase()){
                _match = true
            } else if(req.session.myData.locationTemp.length > 2 && _thisCity.toUpperCase().startsWith(req.session.myData.locationTemp.toUpperCase())){
                req.session.myData.locationTemp = _thisCity
                _match = true
            }
        }
        return _match
    }

    // Search filtering
    function searchFilterSetup(req,_selectedLabel){
        req.session.myData.searchapplied = false
        req.session.myData.searchTerm = ""
        if(req.query.q && req.query.q != ""){
            req.session.myData.searchapplied = true
            req.session.myData.searchTerm = req.query.q.trim()
            req.session.myData.searchfilters.push({"value": "‘" + req.session.myData.searchTerm + "’", "type": "search", "typeText": _selectedLabel})
        }
    }

    // Standard filtering - search
    function standardFilterSetup(req){
        req.session.myData.standardsearchapplied = false
        req.session.myData.standardSearchTerm = ""
        if(req.query.standard){
            req.session.myData.standardSearchTermTemp = req.query.standard.trim()
            for (var i = 0; i < req.session.myData.standards.list.length; i++) {
                var _thisStandard = req.session.myData.standards.list[i]
                if(req.session.myData.standardSearchTermTemp.toUpperCase() == _thisStandard.autoCompleteString.toUpperCase()){
                    req.session.myData.displaycount = 0
                    req.session.myData.needToMatchCount++
                    req.session.myData.standardsearchapplied = true
                    req.session.myData.standardSearchTerm = req.session.myData.standardSearchTermTemp
                    req.session.myData.selectedStandard = _thisStandard
                    req.session.myData.searchfilters.push({"value": _thisStandard.autoCompleteString, "type": "standard", "typeText": "Course name"})
                }
            }
        }
    }

    // Sort setup
    function sortSetup(req,_firstSortType,_secondSortType){
        req.session.myData.sortapplied = false
        if(req.query.sort == _firstSortType || req.query.sort == _secondSortType){
            req.session.myData.sortapplied = true
            req.session.myData.sortby = req.query.sort
        }
    }

    // Check a standard if it matches search term
    function checkStandardSearchTerm(req, _item, _searchesToDo){
        
        _item.search = false
        _item.searchrelevance = 0

        var _matchedsearch = false
        for (var i = 0; i < _searchesToDo.length; i++) {
            var _thisItem = _searchesToDo[i]
            if(Array.isArray(_thisItem.searchOn)){
                _thisItem.searchOn.forEach(function(_arrayPart, index) {
                    doSearches(_arrayPart)
                });
            } else {
                doSearches(_thisItem.searchOn)
            }
            function doSearches(_itemToSearch){
                //Exact check
                if(_thisItem.exactrelevance && _itemToSearch.toUpperCase() == req.session.myData.searchTerm.toUpperCase()){
                    _item.searchrelevance = _item.searchrelevance + _thisItem.exactrelevance
                    _matchedsearch = true
                    if(_thisItem.ifmatch == "exit"){
                        return
                    }
                }
                // Within check
                if(_thisItem.withinrelevance && _itemToSearch.toUpperCase().indexOf(req.session.myData.searchTerm.toUpperCase()) != -1){
                    _item.searchrelevance = _item.searchrelevance + _thisItem.withinrelevance
                    _matchedsearch = true
                    if(_thisItem.ifmatch == "exit"){
                        return 
                    }
                }
            }
            if(_matchedsearch == true && _thisItem.ifmatch == "exit") {
                break
            }
        }
        if(_matchedsearch && _item.searchrelevance > 1){
            req.session.myData.hasAMatchcount++
        }
    }

    // Set the selected standard
    function setSelectedStandard(req, _standardParameter){
        req.session.myData.standardsearchapplied = false
        req.session.myData.selectedStandard = {}
        req.session.myData.standard = ""
        if(_standardParameter){
            for (var i = 0; i < req.session.myData.standards.list.length; i++) {
                var _thisStandard = req.session.myData.standards.list[i]
                if(_thisStandard.larsCode == _standardParameter || _thisStandard.autoCompleteString.toUpperCase() == _standardParameter.toUpperCase()){
                    req.session.myData.standardsearchapplied = true
                    req.session.myData.selectedStandard = _thisStandard
                    req.session.myData.standard = _thisStandard.larsCode
                }
            }
        }
    }

    function reset(req){
        req.session.myData = JSON.parse(JSON.stringify(_myData))

        // Filters defaults
        req.session.myData.location = ""
        // req.session.myData.standard = ""
        // req.session.myData.provider = ""
    }

    // Every GET and POST
    router.all('/' + version + '/*', function (req, res, next) {
        if(!req.session.myData || req.query.r) {
            reset(req)
        }
        //version
        req.session.myData.version = version
        //defaults for setup
        req.session.myData.start = "home"
        //referrer page
        req.session.myData.referrerpage = getRefererPage(req.headers.referer)
        //local storage clear boolean
        // req.session.myData.clearLocalStorage = (req.query.cls) ? true : false

        next()
    });

    // Prototype setup
    router.get('/' + version + '/setup', function (req, res) {
        res.render(version + '/setup', {
            myData:req.session.myData
        });
    });

    // Standards test
    router.get('/' + version + '/standards', function (req, res) {
        res.render(version + '/standards', {
            myData:req.session.myData
        });
    });

    // Start
    router.get('/' + version + '/start', function (req, res) {
        res.render(version + '/start', {
            myData:req.session.myData
        });
    });

    // Home
    router.get('/' + version + '/home', function (req, res) {
        res.render(version + '/home', {
            myData:req.session.myData
        });
    });
    

    // Training
    router.get('/' + version + '/training', function (req, res) {

        var baseUrl = config.apiBaseUrl + 'fatv2/trainingcourses/'
        var queryParams = ''
        req.session.myData.selectedLevelApi = ''
        req.session.myData.selectedRouteApi = ''
        if(req.query.level) {
            queryParams = '?level=' + req.query.level
            req.session.myData.selectedLevelApi = req.query.level;
        }

        if(req.query.route) {
            var route = req.query.route
            if(queryParams){
                queryParams = queryParams + "&sector=" + route
            } else {
                queryParams = '?sector=' + route
            }
            req.session.myData.selectedRouteApi = route;
        }

        if(req.query.q) {
            var keyword = req.query.q;
            if(queryParams){
                queryParams = queryParams + '&keyword=' + keyword
            } else{
                queryParams = '?keyword=' + keyword
            }
        }
        baseUrl = baseUrl + queryParams;

        const request = require('request');
        const options ={
            url: baseUrl,
            headers: {
                'Ocp-Apim-Subscription-Key':config.apimAuthKey
            }
        }

        //Get all data from API
        function callback(error, response, body) {
            var standards = (JSON.parse(body).courses)
            var sectors = (JSON.parse(body).sectors)
            var levels = (JSON.parse(body).levels)
            req.session.myData.standardsApi = standards;

            //Sort
            sortSetup(req,"name","relevance")

            req.session.myData.searchfilters = []
            req.session.myData.displaycount = standards.length
            req.session.myData.needToMatchCount = 0

            // Keyword search reset/setup
            searchFilterSetup(req,"Keywords")

            // Route filter reset/setup
            req.session.myData.routefilterapplied = false
            req.session.myData.route = ""
            req.session.myData.selectedRoute = ""
            req.session.myData.routeApi = sectors
            if(req.session.myData.selectedRouteApi){
                var selectSectorItem = sectors.find(obj => obj.name === req.session.myData.selectedRouteApi)
                if(selectSectorItem){
                    req.session.myData.route = selectSectorItem.name
                    req.session.myData.selectedRoute = selectSectorItem
                    req.session.myData.searchfilters.push({"value": selectSectorItem.name,"type": "route","typeText": "Sector"})
                }
            }

            // Level filter reset/setup
            req.session.myData.levelfilterapplied = false
            req.session.myData.level = ""
            req.session.myData.selectedLevel = ""
            req.session.myData.levelsApi = levels
            if(req.session.myData.selectedLevelApi){
                var item = levels.find(obj => obj.code === parseInt(req.session.myData.selectedLevelApi))

                if(item) {
                    req.session.myData.level = item.code
                    req.session.myData.selectedLevel = item
                    req.session.myData.searchfilters.push({"value": "Level " + item.code + " - " + item.name,"type": "level","typeText": "Level"})
                }

            }

             standards.forEach(function(_standard, index) {
                 req.session.myData.hasAMatchcount = 0

                 _standard.search = true

                 if(req.session.myData.needToMatchCount > 0 && req.session.myData.needToMatchCount == req.session.myData.hasAMatchcount){
                     _standard.search = true
                 }
            });


            res.render(version + '/training', {
                myData:req.session.myData
            });
        };

        request(options,callback);

    });

    // Standard
    router.get('/' + version + '/standard', function (req, res) {


        req.session.myData.standard = req.query.standard || "1"
        req.session.myData.selectedStandard = {}
        req.session.myData.needToMatchCount = 1
        req.session.myData.displaycountproviders = 0
        req.session.myData.displaycountepaos = 0

        var baseUrl = config.apiBaseUrl + 'fatv2/trainingcourses/' + req.session.myData.standard
        if(req.query.location) {
            baseUrl = baseUrl + '?location=' +req.query.location.split(',')[0]
        } else if(req.session.myData.locationapplied) {
            baseUrl = baseUrl + '?location=' + req.session.myData.location.split(',')[0]
        }

        const request = require('request');
        const options ={
            url: baseUrl,
            headers: {
                'Ocp-Apim-Subscription-Key':config.apimAuthKey
            }
        }

        function callback(error, response, body)  {
            var standards = (JSON.parse(body))
            req.session.myData.selectedStandard = standards;


            //Location reset/setup
            if(req.query.location || req.session.myData.location != ""){
                req.session.myData.locationTemp = req.session.myData.location
                if(req.query.location == ""){
                    req.session.myData.locationTemp = ""
                } else if (req.query.location) {
                    req.session.myData.locationTemp = req.query.location.trim()
                }
                require("request").get('https://api.postcodes.io/postcodes/' + req.session.myData.locationTemp + '/autocomplete', (error, response, body) => {
                    var _postCodeMatch = (JSON.parse(body).result && req.session.myData.locationTemp.length > 1)
                    if(cityMatch(req) || _postCodeMatch) {
                        req.session.myData.locationapplied = true
                        req.session.myData.location = req.session.myData.locationTemp
                        req.session.myData.needToMatchCount++
                    } else {
                        req.session.myData.locationapplied = false
                        req.session.myData.location = ""
                    }
                    continueRendering()
                });
            } else {
                continueRendering()
            }
        };


        function continueRendering(){

            // Providers count
            req.session.myData["providers-new"].list.forEach(function(_provider, index) {
                var _deliversStandard = false
                req.session.myData.hasAMatchcount = 0
                //STANDARD
                if(_provider.courses.includes(parseInt(req.session.myData.standard))){
                    _deliversStandard = true
                    req.session.myData.hasAMatchcount++
                }
                //LOCATION
                if(req.session.myData.locationapplied) {
                    if(_deliversStandard && (_provider.national || _provider.locationmatch)){
                        req.session.myData.hasAMatchcount++
                    }
                }
                //MATCHES ALL IT NEEDS TO?
                if(req.session.myData.needToMatchCount == req.session.myData.hasAMatchcount){
                    req.session.myData.displaycountproviders++
                }
            });
            // EPAOS count
            req.session.myData.epaos.list.forEach(function(_epao, index) {
                var _deliversStandard = false
                req.session.myData.hasAMatchcountEPAO = 0
                //STANDARD
                //if(req.session.myData.selectedStandard.epaos.list.includes(_epao.name)){
                //    _deliversStandard = true
                //    req.session.myData.hasAMatchcountEPAO++
                //}
                //LOCATION
                if(req.session.myData.locationapplied) {
                    if(_deliversStandard && _epao.locationmatch){
                        req.session.myData.hasAMatchcountEPAO++
                    }
                }
                //MATCHES ALL IT NEEDS TO?
                if(req.session.myData.needToMatchCount == req.session.myData.hasAMatchcountEPAO){
                    req.session.myData.displaycountepaos++
                }

            });

            res.render(version + '/standard', {
                myData:req.session.myData
            });
        }

        request(options,callback);
    });

    // Providers
    router.get('/' + version + '/providers', function (req, res) {

        const request = require('request');

        var baseUrl = config.apiBaseUrl + 'fatv2/trainingcourses/' + req.query.standard + '/providers'
        if(req.query.location) {
            baseUrl = baseUrl + '?location=' +req.query.location.split(',')[0]
        } else if(req.session.myData.locationapplied) {
            baseUrl = baseUrl + '?location=' + req.session.myData.location.split(',')[0]
        }

        const options ={
            url: baseUrl,
            headers: {
                'Ocp-Apim-Subscription-Key':config.apimAuthKey
            }
        }

        function callback(error, response, body) {
            var standard = (JSON.parse(body).standard)
            var providers = (JSON.parse(body).providers)


            //Sort
            sortSetup(req,"name","distance")

            req.session.myData.searchfilters = []
            req.session.myData.selectedStandard = {}
            req.session.myData.displaycount = providers.length
            req.session.myData.needToMatchCount = 0
            req.session.myData.providersApi = providers

            req.session.myData.standardfilterapplied = false
            var _selectedStandardID = req.query.standard || req.session.myData.standard
            if(_selectedStandardID){
                req.session.myData.standard = _selectedStandardID
                req.session.myData.standardfilterapplied = true
                req.session.myData.selectedStandard = standard
            }

            // Standard filter reset/setup

            //Location reset/setup
            if(req.query.location || req.session.myData.location != ""){
                req.session.myData.locationTemp = req.session.myData.location
                if(req.query.location == ""){
                    req.session.myData.locationTemp = ""
                } else if (req.query.location) {
                    req.session.myData.locationTemp = req.query.location.trim()
                }
                require("request").get('https://api.postcodes.io/postcodes/' + req.session.myData.locationTemp + '/autocomplete', (error, response, body) => {
                    var _postCodeMatch = (JSON.parse(body).result && req.session.myData.locationTemp.length > 1)
                    if(cityMatch(req) || _postCodeMatch) {
                        req.session.myData.locationapplied = true
                        req.session.myData.location = req.session.myData.locationTemp
                        req.session.myData.searchfilters.push({"value": req.session.myData.location, "type": "location", "typeText": "Location of apprenticeship"})
                    } else {
                        req.session.myData.locationapplied = false
                        req.session.myData.location = ""
                    }
                    continueRendering()
                });
            } else {
                continueRendering()
            }
        }

        function continueRendering(){

            // Keyword search reset/setup
            searchFilterSetup(req,"Training provider name")

            if(req.session.myData.locationapplied){
                if(req.session.myData.sortby == "name"){
                    sortProviders(req, "name")
                } else {
                    sortProviders(req, "distance")
                }
            } else {
                sortProviders(req, "name")
            }

            res.render(version + '/providers', {
                myData:req.session.myData
            });

        }

        request(options,callback);

    });

    // Providers
    router.get('/' + version + '/providers-all', function (req, res) {

        //Sort
        sortSetup(req,"name","distance")

        var _providers = req.session.myData["providers-new"].list

        req.session.myData.searchfilters = []
        req.session.myData.displaycount = _providers.length
        req.session.myData.needToMatchCount = 0

        //Location filter reset/setup
        if(req.query.location || req.session.myData.location != ""){
            req.session.myData.locationTemp = req.session.myData.location
            if(req.query.location == ""){
                req.session.myData.locationTemp = ""
            } else if (req.query.location) {
                req.session.myData.locationTemp = req.query.location.trim()
            }
            require("request").get('https://api.postcodes.io/postcodes/' + req.session.myData.locationTemp + '/autocomplete', (error, response, body) => {
                var _postCodeMatch = (JSON.parse(body).result && req.session.myData.locationTemp.length > 1)
                if(cityMatch(req) || _postCodeMatch) {
                    req.session.myData.displaycount = 0
                    req.session.myData.needToMatchCount++
                    req.session.myData.locationapplied = true
                    req.session.myData.location = req.session.myData.locationTemp
                    req.session.myData.searchfilters.push({"value": req.session.myData.location, "type": "location", "typeText": "Location of apprenticeship"})
                } else {
                    req.session.myData.locationapplied = false
                    req.session.myData.location = ""
                }
                continueRendering()
            });
        } else {
            continueRendering()
        }

        function continueRendering(){

            // Standard filter reset/setup
            standardFilterSetup(req)
            
            // Keyword search reset/setup
            searchFilterSetup(req,"Training provider name")

            // FILTER providers
            _providers.forEach(function(_provider, index) {

                req.session.myData.hasAMatchcount = 0

                // Reset each provider
                _provider.search = true
    
                //STANDARD SEARCH TERM
                if(req.session.myData.standardsearchapplied) {
                    _provider.search = false
                    if(_provider.courses.includes(req.session.myData.selectedStandard.larsCode)){
                        req.session.myData.hasAMatchcount++
                    }
                }
    
                //LOCATION
                if(req.session.myData.locationapplied) {
                    _provider.search = false
                    if(_provider.national || _provider.locationmatch){
                        req.session.myData.hasAMatchcount++
                    }
                }
    
                //SEARCH TERM
                if(req.session.myData.searchapplied) {
                    var _searchesToDo = [
                        {"searchOn": _provider.autoCompleteString,"exactrelevance": 999999,"withinrelevance": 100000,"ifmatch": "exit"}
                    ]
                    checkStandardSearchTerm(req,_provider,_searchesToDo)
                }
    
                //MATCHES ALL IT NEEDS TO?
                if(req.session.myData.needToMatchCount > 0 && req.session.myData.needToMatchCount == req.session.myData.hasAMatchcount){
                    _provider.search = true
                    req.session.myData.displaycount++
                }
    
            });
    
            if(req.session.myData.locationapplied){
                if(req.session.myData.sortby == "name"){
                    sortProviders(req, "name")
                } else {
                    sortProviders(req, "distance")
                }
            } else {
                sortProviders(req, "name")
            }
    
            res.render(version + '/providers-all', {
                myData:req.session.myData
            });
        }

    });

    // Provider
    router.get('/' + version + '/provider', function (req, res) {

        var _standards = req.session.myData.standards.list

        // Provider
        req.session.myData.provider = req.query.provider
        for (var i = 0; i < req.session.myData["providers-new"].list.length; i++) {
            var _thisProvider = req.session.myData["providers-new"].list[i]
            if(req.session.myData.provider == _thisProvider.ukprn){
                req.session.myData.selectedProvider = _thisProvider
            }
        }
        // Provider - standards list
        req.session.myData.displaycount = 0
        for (var i = 0; i < _standards.length; i++) {
            var _thisStandard = _standards[i]
            _thisStandard.matchesProvider = false
            if(req.session.myData.selectedProvider.courses.includes(_thisStandard.larsCode)) {
                req.session.myData.displaycount++
                _thisStandard.matchesProvider = true
            }
        }

        //Selected standard
        setSelectedStandard(req,req.query.standard)

        //Location reset/setup
        if(req.query.location || req.session.myData.location != ""){
            req.session.myData.locationTemp = req.session.myData.location
            if(req.query.location == ""){
                req.session.myData.locationTemp = ""
            } else if (req.query.location) {
                req.session.myData.locationTemp = req.query.location.trim()
            }
            require("request").get('https://api.postcodes.io/postcodes/' + req.session.myData.locationTemp + '/autocomplete', (error, response, body) => {
                var _postCodeMatch = (JSON.parse(body).result && req.session.myData.locationTemp.length > 1)
                if(cityMatch(req) || _postCodeMatch) {
                    req.session.myData.locationapplied = true
                    req.session.myData.location = req.session.myData.locationTemp
                } else {
                    req.session.myData.locationapplied = false
                    req.session.myData.location = ""
                }
                continueRendering()
            });
        } else {
            continueRendering()
        }
        
        function continueRendering(){
            res.render(version + '/provider', {
                myData:req.session.myData
            });
        }

    });

    // EPAOs
    router.get('/' + version + '/epaos', function (req, res) {

        //Sort
        sortSetup(req,"name","distance")

        var _epaos = req.session.myData.epaos.list,
            _standards = req.session.myData.standards.list

        req.session.myData.searchfilters = []
        req.session.myData.displaycount = _epaos.length
        req.session.myData.needToMatchCount = 0
        req.session.myData.selectedStandard = {}

        // Standard filter reset/setup
        req.session.myData.standardfilterapplied = false
        var _selectedStandardID = req.query.standard || req.session.myData.standard
        for (var i = 0; i < _standards.length; i++) {
            var _thisStandard = _standards[i]
            if(_selectedStandardID == _thisStandard.larsCode){
                req.session.myData.standard = _selectedStandardID
                req.session.myData.standardfilterapplied = true
                req.session.myData.displaycount = 0
                req.session.myData.selectedStandard = _thisStandard
                req.session.myData.needToMatchCount++
                break
            }
        }

        //Location reset/setup
        if((req.query.location || req.session.myData.location != "") && req.session.myData.standardfilterapplied){
            req.session.myData.locationTemp = req.session.myData.location
            if(req.query.location == ""){
                req.session.myData.locationTemp = ""
            } else if (req.query.location) {
                req.session.myData.locationTemp = req.query.location.trim()
            }
            require("request").get('https://api.postcodes.io/postcodes/' + req.session.myData.locationTemp + '/autocomplete', (error, response, body) => {
                var _postCodeMatch = (JSON.parse(body).result && req.session.myData.locationTemp.length > 1)
                if(cityMatch(req) || _postCodeMatch) {
                    req.session.myData.displaycount = 0
                    req.session.myData.needToMatchCount++
                    req.session.myData.location = req.session.myData.locationTemp
                    req.session.myData.locationapplied = true
                    req.session.myData.searchfilters.push({"value": req.session.myData.location, "type": "location", "typeText": "Location of apprenticeship"})
                } else {
                    req.session.myData.locationapplied = false
                    req.session.myData.location = ""
                }
                continueRendering()
            });
        } else {
            continueRendering()
        }

        function continueRendering(){

            // Keyword search reset/setup
            searchFilterSetup(req,"Assessment organisation name")

            _epaos.forEach(function(_epao, index) {
                
                var _deliversStandard = false,
                    _epaoIndex = 0

                req.session.myData.hasAMatchcount = 0

                // Reset each epao
                _epao.search = true

                //STANDARD
                if(req.session.myData.standardfilterapplied) {
                    _epao.search = false
                    req.session.myData.selectedStandard.epaos.list.forEach(function(_epaoOnStandard, index) {
                        if(_epaoOnStandard.toUpperCase() == _epao.name.toUpperCase()){
                            _epaoIndex = index
                            _deliversStandard = true
                            req.session.myData.hasAMatchcount++
                        }
                    });
                }

                //LOCATION
                if(req.session.myData.locationapplied) {
                    _epao.search = false
                    if(_epao.locationmatch){
                        req.session.myData.hasAMatchcount++
                    }
                }

                //SEARCH TERM
                if(req.session.myData.searchapplied) {
                    var _searchesToDo = [
                        {"searchOn": _epao.autoCompleteString,"exactrelevance": 999999,"withinrelevance": 100000,"ifmatch": "exit"}
                    ]
                    checkStandardSearchTerm(req,_epao,_searchesToDo)
                }

                //MATCHES ALL IT NEEDS TO?
                if(req.session.myData.needToMatchCount > 0 && req.session.myData.needToMatchCount == req.session.myData.hasAMatchcount){
                    _epao.search = true
                    req.session.myData.displaycount++
                }

            });

            if(req.session.myData.locationapplied){
                if(req.session.myData.sortby == "name"){
                    sortEPAOs(req, "name")
                } else {
                    sortEPAOs(req, "distance")
                }
            } else {
                sortEPAOs(req, "name")
            }

            res.render(version + '/epaos', {
                myData:req.session.myData
            });

        }

    });

    // EPAOS
    router.get('/' + version + '/epaos-all', function (req, res) {

        //Sort
        sortSetup(req,"name","distance")

        req.session.myData.searchfilters = []
        req.session.myData.displaycount = req.session.myData.epaos.list.length
        req.session.myData.needToMatchCount = 0

        //Location reset/setup
        if(req.query.location || req.session.myData.location != ""){
            req.session.myData.locationTemp = req.session.myData.location
            if(req.query.location == ""){
                req.session.myData.locationTemp = ""
            } else if (req.query.location) {
                req.session.myData.locationTemp = req.query.location.trim()
            }
            require("request").get('https://api.postcodes.io/postcodes/' + req.session.myData.locationTemp + '/autocomplete', (error, response, body) => {
                var _postCodeMatch = (JSON.parse(body).result && req.session.myData.locationTemp.length > 1)
                if(cityMatch(req) || _postCodeMatch) {
                    req.session.myData.displaycount = 0
                    req.session.myData.needToMatchCount++
                    req.session.myData.location = req.session.myData.locationTemp
                    req.session.myData.locationapplied = true
                    req.session.myData.searchfilters.push({"value": req.session.myData.location, "type": "location", "typeText": "Location of apprenticeship"})
                } else {
                    req.session.myData.locationapplied = false
                    req.session.myData.location = ""
                }
                continueRendering()
            });
        } else {
            continueRendering()
        }

        function continueRendering(){
    
            // Standard filter reset/setup
            standardFilterSetup(req)

            // Keyword search reset/setup
            searchFilterSetup(req,"Assessment organisation name")

            req.session.myData.epaos.list.forEach(function(_epao, index) {

                var _epaoIndex = 0

                req.session.myData.hasAMatchcount = 0

                // Reset each epao
                _epao.search = true

                //STANDARD SEARCH TERM
                if(req.session.myData.standardsearchapplied) {
                    _epao.search = false
                    req.session.myData.selectedStandard.epaos.list.forEach(function(_epaoOnStandard, index) {
                        if(_epaoOnStandard.toUpperCase() == _epao.name.toUpperCase()){
                            _epaoIndex = index
                            req.session.myData.hasAMatchcount++
                        }
                    });
                }

                //LOCATION
                if(req.session.myData.locationapplied) {
                    _epao.search = false
                    if(_epao.locationmatch){
                        req.session.myData.hasAMatchcount++
                    }
                }

                //SEARCH TERM
                if(req.session.myData.searchapplied) {
                    var _searchesToDo = [
                        {"searchOn": _epao.autoCompleteString,"exactrelevance": 999999,"withinrelevance": 100000,"ifmatch": "exit"}
                    ]
                    checkStandardSearchTerm(req,_epao,_searchesToDo)
                }

                //MATCHES ALL IT NEEDS TO?
                if(req.session.myData.needToMatchCount > 0 && req.session.myData.needToMatchCount == req.session.myData.hasAMatchcount){
                    _epao.search = true
                    req.session.myData.displaycount++
                }

            });

            if(req.session.myData.locationapplied){
                if(req.session.myData.sortby == "name"){
                    sortEPAOs(req, "name")
                } else {
                    sortEPAOs(req, "distance")
                }
            } else {
                sortEPAOs(req, "name")
            }

            res.render(version + '/epaos-all', {
                myData:req.session.myData
            });

        }

    });

    // Epao
    router.get('/' + version + '/epao', function (req, res) {

        req.session.myData.epao = req.query.epao || "1"
        
        res.render(version + '/epao', {
            myData:req.session.myData
        });

    });

}