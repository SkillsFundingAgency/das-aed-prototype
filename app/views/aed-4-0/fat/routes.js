const express = require('express')
const router = express.Router()

 // Sort setup
 function sortSetup(req,_firstSortType,_secondSortType){
    req.session.data['sortapplied'] = false
    if(req.query.sort == _firstSortType || req.query.sort == _secondSortType){
        req.session.data['sortapplied'] = true
        req.session.data['sortby'] = req.query.sort
    }
}

// Search filtering
function searchFilterSetup(req,_selectedLabel){
    req.session.data['searchapplied'] = false
    req.session.data['searchTerm'] = ""
    if(req.query.q && req.query.q != ""){
        req.session.data['displaycount'] = 0
        req.session.data['displaycountExcludingLocation'] = 0
        req.session.data['needToMatchCount']++
        req.session.data['needToMatchCountExcludingLocation']++
        req.session.data['searchapplied'] = true
        req.session.data['searchTerm'] = req.query.q.trim()
        req.session.data['searchfilters'].push({"value": "‘" + req.session.data['searchTerm'] + "’", "type": "search", "typeText": _selectedLabel})
    }
}

// Route filters - setup
function routeFilterSetup(req){
    req.session.data['routefilterapplied'] = false
    if(req.session.data['routefilters'].length > 0){
        req.session.data['displaycount'] = 0
        req.session.data['needToMatchCount']++
        req.session.data['routefilterapplied'] = true
        var routefiltersValues = []
        req.session.data['routefilters'].forEach(function(_routeFilter, index) {
            var _route = req.session.data['routes'].list.find(obj => obj.code.toString() === _routeFilter)
            if(_route){
                routefiltersValues.push({
                    "label":_route.name,
                    "id":_route.code
                })
            }
        });
        req.session.data['searchfilters'].push({"value": routefiltersValues, "type": "routefilters", "typeText": "Apprenticeship category","typeof":"array"})
    }
}

//Sort standards
function sortStandards(req, _sortBy){
    req.session.data['standards'].list.sort(function(a,b){

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

// Level filters - setup
function levelFilterSetup(req){
    req.session.data['levelfilterapplied'] = false
    if(req.session.data['levelfilters'].length > 0){
        req.session.data['displaycount'] = 0
        req.session.data['needToMatchCount']++
        req.session.data['levelfilterapplied'] = true
        var levelfiltersValues = []
        req.session.data['levelfilters'].forEach(function(_levelFilter, index) {
            var _level = req.session.data['levels'].find(obj => obj.value === _levelFilter)
            if(_level){
                levelfiltersValues.push({
                    "label":"Level " + _level.value + " - " + _level.equiv2,
                    "id":_level.value
                })
            }
        });
        req.session.data['searchfilters'].push({"value": levelfiltersValues, "type": "levelfilters", "typeText": "Qualification level","typeof":"array"})
    }
}

// Every GET and POST
router.all('/*', function (req, res, next) {
        //1st load reset could be true
        if(req.session.data['clearLocalStorageNext']){
            req.session.data['clearLocalStorageNext'] = false;
        } else {
            //2nd load onwards reset is false
            req.session.data['clearLocalStorageReset'] = false;
        }
        req.session.data['clearLocalStorage'] = req.session.data['clearLocalStorageReset'];

        // Reset page validation to false by default. Will only be set to true, if applicable, on a POST of a page
        req.session.data['validationErrors'] = {}
        req.session.data['validationError'] = "false"
        req.session.data['includeValidation'] =  req.query.includeValidation || req.session.data['includeValidation']

        //Reset page notifications
        req.session.data['notifications'] = {}
        req.session.data['showNotification'] = "false"

        //defaults for setup
        req.session.data['employeraccount'] =  req.query.ea || req.session.data['employeraccount']
        req.session.data['epaoinfat'] =  req.query.epaofat || req.session.data['epaoinfat']
        req.session.data['layout'] = ((req.session.data['employeraccount'] == "true") ? "layout-as-emp.html" : "layout.html")
        req.session.data['service'] =  req.query.s || req.session.data['service']
        // req.session.data['phase =  req.query.p || req.session.data['phase
        
        //component visibility - for devs
        //courses
        req.session.data['cmpcfk'] =  req.query.cmpcfk || req.session.data['cmpcfk']
        req.session.data['cmpcfs'] =  req.query.cmpcfs || req.session.data['cmpcfs']
        req.session.data['cmpcfl'] =  req.query.cmpcfl || req.session.data['cmpcfl']
        //providers
        req.session.data['cmppfl'] =  req.query.cmppfl || req.session.data['cmppfl']
        req.session.data['cmppfo'] =  req.query.cmppfo || req.session.data['cmppfo']
        req.session.data['cmppfe'] =  req.query.cmppfe || req.session.data['cmppfe']
        req.session.data['cmppfd'] =  req.query.cmppfd || req.session.data['cmppfd']
        req.session.data['cmppda'] =  req.query.cmppda || req.session.data['cmppda']
        req.session.data['cmppdo'] =  req.query.cmppdo || req.session.data['cmppdo']
        req.session.data['cmppde'] =  req.query.cmppde || req.session.data['cmppde']
        req.session.data['cmppdoc'] =  req.query.cmppdoc || req.session.data['cmppdoc']
        req.session.data['cmpstar'] =  req.query.cmpstar || req.session.data['cmpstar']
        req.session.data['cmppfc'] =  req.query.cmppfc || req.session.data['cmppfc']

        req.session.data['maxrows'] =  req.query.maxrows || 999999

        req.session.data['populateShortlist'] =  req.query.populateShortlist || false
        req.session.data['countShortlist'] =  req.query.countShortlist || 2
        
        //referrer page
        // req.session.data['referrerpage'] = getRefererPage(req.headers.referer)
        //local storage clear boolean
        // req.session.data['clearLocalStorage = (req.query.cls) ? true : false

        // TODO actually make thsi work because it doesnt :D 
        req.session.data['returnURLepaos2'] =  req.query.returnURLepaos2 || req.session.data['returnURLepaos2']
        req.session.data['returnURLepaos2'] = req.body.returnURLepaos2 || req.session.data['returnURLepaos2']
        req.session.data['returnURLepao2'] =  req.query.returnURLepao2 || req.session.data['returnURLepao2']
        req.session.data['returnURLepao2'] = req.body.returnURLepao2 || req.session.data['returnURLepao2']
        req.session.data['returnURLepaodropout'] =  req.query.returnURLepaodropout || req.session.data['returnURLepaodropout']
        req.session.data['returnURLepaodropout'] = req.body.returnURLepaodropout || req.session.data['returnURLepaodropout']

        
        //Constant checks for query
        req.session.data['standard'] = req.query.standard || req.session.data['standard']
        req.session.data['provider'] = req.query.provider || req.session.data['provider']
        req.session.data['epao'] = req.query.epao || req.session.data['epao']

        // setSelectedProvider(req,req.session.data['provider'])
        // setSelectedStandard(req,req.session.data['standard'])

        //
        // Fixes for checkbox values in query string - turns them into arrays
        //
        var _checkboxQueries = [
        "trainingoptions",
        "employerreviews",
        "ofstedratings",
        "regionfilters",
        "national",
        "routefilters",
        "levelfilters"
        ]
        _checkboxQueries.forEach(function(_checkboxQuery, index) {
            req.session.data[_checkboxQuery] = req.query[_checkboxQuery] || []
            if(req.session.data[_checkboxQuery] == "_unchecked"){
                req.session.data[_checkboxQuery] = []
            }
            if(!Array.isArray(req.session.data[_checkboxQuery])){
                req.session.data[_checkboxQuery] = [req.session.data[_checkboxQuery]]
            }
        });

        // Sort providers
        if(req.session.data['qualityPointsSet'] == false){
            //Set quality points
            req.session.data['providers-new'].list.forEach(function(_provider, index) {
                setProviderPoints(req,_provider)
            });
        }

        next()
    });

router.get('/training', function (req, res) {

        //Sort
        sortSetup(req,"name","relevance")

        req.session.data['searchfilters'] = []
        req.session.data['displaycount'] = req.session.data['standards'].list.length
        req.session.data['needToMatchCount'] = 0

        // Keyword search reset/setup
        searchFilterSetup(req,"Keywords")

        // Level filter reset/setup
        levelFilterSetup(req)
        
        // Route filter setup
        routeFilterSetup(req)

        req.session.data['standards'].list.forEach(function(_standard, index) {

            req.session.data['hasAMatchcount'] = 0

            // Reset each standard
            _standard.search = true

            //SEARCH TERM
            if(req.session.data['searchapplied']) {
                var _searchesToDo = [
                {"searchOn": _standard.autoCompleteString,"exactrelevance": 999999,"withinrelevance": 100000,"ifmatch": "exit"},
                {"searchOn": _standard.title,"exactrelevance": 99999,"withinrelevance": 10000,"ifmatch": "exit"},
                {"searchOn": _standard.jobRoles,"exactrelevance": 5000,"withinrelevance": 100,"ifmatch": "carryon"},
                {"searchOn": _standard.keywords,"exactrelevance": 1000,"ifmatch": "carryon"}
                ]
                checkStandardSearchTerm(req,_standard,_searchesToDo)
            }

            //LEVEL
            if(req.session.data['levelfilterapplied']) {
                _standard.search = false
                var _level = req.session.data['levelfilters'].find(obj => obj === _standard.level.toString())
                if(_level){
                    req.session.data['hasAMatchcount']++
                }
            }

            //ROUTE
            if(req.session.data['routefilterapplied']) {
                _standard.search = false
                var _route = req.session.data['routefilters'].find(obj => obj === _standard.routecode.toString())
                if(_route){
                    req.session.data['hasAMatchcount']++
                }
            }

            //MATCHES ALL IT NEEDS TO?
            if(req.session.data['needToMatchCount'] > 0 && req.session.data['needToMatchCount'] == req.session.data['hasAMatchcount']){
                _standard.search = true
                req.session.data['displaycount']++
            }

        });

        if(req.session.data['searchapplied']){
            if(req.session.data['sortby'] == "name"){
                sortStandards(req, "name")
            } else {
                sortStandards(req, "searchrelevance")
            }
        } else {
            sortStandards(req, "name")
        }

        res.render(`${req.version}/fat/training`, {
            myData:req.session.data
        });

    });

module.exports = router