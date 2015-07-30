

function loaddata()
{
    var req = new XMLHttpRequest();
    // make an asynchronous call to retrieve the electricity data
    req.open("GET", "./data/electricity_data.json", false);
    req.send(null);
    return JSON.parse(req.responseText);
}

function getmultiples(o)
{
    var opts = [];
    for (var i = 0; i < o.options.length; i++) {
        if (o.options[i].selected)
        {
            opts.push(o.options[i].value);
        }
    }
    return opts;
}

function getsubregions(region)
{
    if (region == 'World')
    {
        return Object.keys(regions).sort();
    }
    else
    {
        return Object.keys(regions[region]).sort();
    }
}

function getcountries(region, subregion)
{
    return regions[region][subregion];
}

function getdescription(name)
{
    return ((descriptions[name] == null) ? name : descriptions[name]);
}

function isnumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

function getunits(valuetype, population)
{
    // determine the multiplier to use for per capita units
    var mult = 1;
    var units = "MkWh";
    if (valuetype == 'percap') {
        mult = 1000000 / Number(population);
        units = "kWh per capita"
    }
    return {'units': units, 'mult': mult};
}

function getflowgroups(flow)
{
    var flowgroups = []
    if (flow == 'production')
    {
        flowgroups = ['production', 'consumption'];
    }
    else if (flow == "renewable")
    {
        flowgroups = ['renewable', 'nonrenewable'];
    }
    else if (flow == "import")
    {
        flowgroups = ['imported', 'exported'];
    }
    else
    {
        // default to production/consumption
        flowgroups = ['production', 'consumption'];
    }
    return flowgroups;
}

function getflowtypes_unused(flow)
{
    var flowgroups = getflowgroups(flow);
    var flowtypes = {};
    for (var i = 0; i < flowgroups.length; i++)
    {
        flowgroup = flowgroups[i];
        for (j = 0; j < flowgroup.length; j++)
        {
            flowtypes[flowgroup[j]] = 1;
        }
    }
    console.log('getflowtypes_unused: ' + Object.keys(flowtypes).sort());
    return Object.keys(flowtypes).sort();
}

function getflowtypes(flow)
{
    var flowlist = [];
    if (flow == "renewable")
    {
        flowlist = renewables;
    }
    else if (flow == "nonrenewable")
    {
        flowlist = nonrenewables;
    }
    else if (flow == "consumption")
    {
        flowlist = consumption;
    }
    else if (flow == "production")
    {
        flowlist = production;
    }
    else if (flow == "import")
    {
        flowlist = imports;
    }
    else if (flow == "imported")
    {
        flowlist = imports;
    }
    else if (flow == "exports")
    {
        flowlist = exports;
    }
    else if (flow == "exported")
    {
        flowlist = exports;
    }
    else if (flow == "import_export")
    {
        flowlist = import_export;
    }
    else
    {
        flowlist = all;
    }
    var flowtypes = [];
    for (j = 0; j < flowlist.length; j++)
    {
        flowtypes[flowlist[j]] = 1;
    }
    return Object.keys(flowtypes).sort();
}

function getwheeldata(names, years, valuetype, adjoining)
{
    var wheeldata = [];
    var region = names[0];
    var selectedyear = years[0];
    var yearlist = getyearlist(selectedyear, adjoining)
    for (var i = 0; i < yearlist.length; i++)
    {
        var year = yearlist[i];
        if (isnumeric(year))
        {
            var facts = data[region][year];
            var r = new Object();
            r['name'] = region;
            r['year'] = year;
            r['selected'] = (year == selectedyear) ? 'Y' : 'N';
            r['population'] = facts.population;
            var units = getunits(valuetype, r.population);
            r['electricity'] = Math.round(units.mult * facts.electricity);
            r['units'] = units.units;
            wheeldata.push(r);
        }
    }
    return wheeldata;
}

var minyear = 1990;
var maxyear = 2012;
function getyearlist(selectedyear, adjoining)
{
    // generate list of years
    // if adjoining < 0, return all years
    var selectedyear = parseInt(selectedyear);
    var yearlist = [];
    var start = minyear;
    var end = maxyear;
    if (adjoining >= 0)
    {
        start = Math.max(selectedyear - adjoining, minyear);
        end =   Math.min(selectedyear + adjoining, maxyear);
    }
    for (var i = start; i <= end; i++)
    {
        yearlist.push(String(i));
    }
    return yearlist;
}

function setpercent(level, target)
{
    var total = 0;
    for (var i = 0; i < level.length; i++)
    {
        total = total + level[i]['value'];
    }
    for (var i = 0; i < level.length; i++)
    {
        var p = 0;
        if (total > 0)
        {
            p = Math.round(level[i]['value'] / total * target);
        }
        level[i]['percent'] = p;
        var ch = level[i]['children'];
        if (typeof ch == 'object' && level[i]['children'].length > 0)
        {
            setpercent(level[i]['children'], p);
        }
    }
}


function query(names, years, valuetype, flows, hierarchy)
{
    var curdata = [];
    for (var i = 0; i < names.length; i++)
    {
        var region = names[i];
        var nyears = data[region];
        for (var j = 0; j < years.length; j++)
        {
            var year = years[j];
            var facts = data[region][year];
            var r = new Object();
            r['name'] = region;
            r['year'] = year;
            r['population'] = facts.population;
            var units = getunits(valuetype, r.population);
            r['isregion'] = nyears.isregion;
            r['issubregion'] = nyears.issubregion;
            r['region'] = nyears.region;
            r['subregion'] = nyears.subregion;
            r['renewable'] = Math.round(units.mult * facts.renewable);
            r['nonrenewable'] = Math.round(units.mult * facts.nonrenewable);
            r['units'] = units.units;
            curdata.push(getAttributes(r, facts, units, flows, hierarchy));
            if (nyears.isregion == 'Y')
            {
                var subregions = getsubregions(region);
                r['subregions'] = query(subregions, years, valuetype, flows);
            }
            if (r['issubregion'] == 'Y')
            {
                var countries = getcountries(nyears.region, region);
                if (region == 'Micronesia')
                {
                    // hack to handle the fact that Micronesia is a country and a subregion
                    // we lose Micronesia as a country to avoid an infinite loop
                    var idx = countries.indexOf("Micronesia");
                    if (idx >= 0)
                    {
                        countries.splice(idx, 1);
                    }
                }
                r['countries'] = query(countries, years, valuetype, flows);
            }
        }
    }
    return curdata;
}

function getAttributes(r, facts, units, flows, hierarchy) {
    // build list of requested flow types
    var flowlist = [];
    for (var i = 0; i < flows.length; i++)
    {
        var flow = flows[i].toLowerCase();
        flowlist = getflowlist(flow);
    }
    var details = [];
    for (var flow in flowtypes)
    {
        // if value == 0 should we not include it in list?
        details.push({
            "name": key,
            "value": Math.round(units.mult * facts[flow]),
            "units": units.units,
            "desc": getdescription(flow)
        });
    }
    r["details"] = details;
    return r;
}

function init()
{
    data = loaddata();
    updatedata();
}


function updatedata()
{
    var regions = getmultiples(document.getElementById("region"));
    var years = getmultiples(document.getElementById("year"));
    var valuetype = document.getElementById("units").value;
    var flows = getmultiples(document.getElementById("flow"));
    var hierarchy = document.getElementById("hierarchy").value;
    var adjoiningyears = parseInt(document.getElementById("adjoining").value);

    var wheeldata = getwheeldata(regions, years, valuetype, adjoiningyears);
    var maxlevels = 2;
    var sankeydata = getsankeydata(regions[0], years[0], valuetype, flows[0], hierarchy, maxlevels);
    drawdata([wheeldata, sankeydata], ['Wheel Data', 'Sankey Data']);
}

function drawdata(dataarray, labels)
{
    for (var i = 0; i < dataarray.length; i++)
    {
        var thisdata = dataarray[i];
        var s = "";
        thisdata.forEach(function(item, index, array)
                         {
                             s = s + JSON.stringify(item, null, '  ') + "\n";
                         });
        s = "<hr/><br/><strong>" + labels[i] + "</strong><br/><hr/>" + "<pre>" + s;
        s = s + "</pre>" + "<hr/>";
        var c = "code" + (i + 1);
        document.getElementById(c).innerHTML = s;
    }
}

function getsankeydata(name, selectedyear, valuetype, flow, hierarchy, maxlevels)
{
    var sankeydata = [];

    var region = data[name];
    var flowgroups = getflowgroups(flow);
    var sankeydata = [];

    if (hierarchy == 'energy')
    {
        var year = data[name][selectedyear];
        var units = getunits(valuetype, year.population);

        for (var i = 0; i < flowgroups.length; i++)
        {
            var cflow = flowgroups[i];
            var r = new Object();
            r['name'] = name;
            r['year'] = selectedyear;
            r['value'] = Math.round(units.mult * year[cflow]);
            r['units'] = units.units;
            r['description'] = getdescription(cflow); // NOTE: need to create descriptions for higher-level energy flows
            r['children'] = getsankeychildrenregions(name, selectedyear, cflow, units);
            sankeydata.push(r);
        }
    }
    else if (hierarchy == 'region')
    {
        var regionlist = [];
        if (region.isregion == 'Y')
        {
            regionlist = Object.keys(regions[name]).sort();
        }
        else if (region.issubregion == 'Y')
        {
            regionlist = regions[region['region']][name]; // this is confusing
        }
        else
        {
            // this is a country, no further geographic details available
            regionlist = [];
        }
        for (var i = 0; i < regionlist.length; i++)
        {
            var cflow = 'electricity';
            var cregion = regionlist[i];
            var year = data[cregion][selectedyear];
            var units = getunits(valuetype, year.population);
            var r = new Object();
            r['name'] = cregion;
            r['year'] = selectedyear;
            r['value'] = Math.round(units.mult * year[cflow]);
            r['units'] = units.units;
            r['description'] = getdescription(cflow); // NOTE: need to create descriptions for higher-level energy flows
            r['children'] = getsankeychildrenenergy(cregion, selectedyear, flow, units);

            sankeydata.push(r);
        }
        
    }
    setpercent(sankeydata, 100);
    return sankeydata;
}

function getsankeychildrenenergy(name, selectedyear, flow, units)
{
    var children = [];
    var region = data[name];
    var flowgroups = getflowgroups(flow);
    var year = data[name][selectedyear];
    for (var i = 0; i < flowgroups.length; i++)
    {
        var cflow = flowgroups[i];
        var r = new Object();
        r['name'] = name;
        r['year'] = selectedyear;
        r['value'] = Math.round(units.mult * year[cflow]);
        r['units'] = units.units;
        r['description'] = getdescription(cflow); // NOTE: need to create descriptions for higher-level energy flows
        r['children'] = getsankeyenergydetails(region, year, cflow, units);
        children.push(r);
    }
    return children;
}

function getsankeychildrenregions(name, selectedyear, flow, units)
{
    
    var children = [];
    var regionlist = [];
    var region = data[name];
    if (region.isregion == 'Y')
    {
        regionlist = Object.keys(regions[name]).sort();
    }
    else if (region.issubregion == 'Y')
    {
        regionlist = regions[region['region']][name]; // this is confusing
    }
    else
    {
        // this is a country, no further details necessary
        regionlist = [];
    }
    for (i = 0; i < regionlist.length; i++)
    {
        var cname = regionlist[i];
        var cregion = data[cname];
        var cyear = data[cname][selectedyear];
        var value = cyear[flow];
        r = new Object();
        r['name'] = cname;
        r['value'] = Math.round(units.mult * value);
        r['units'] = units.units;
        r['description'] = getdescription(flow);
        r['children'] = getsankeyenergydetails(cregion, cyear, flow, units);
        children.push(r);
    }
    return children;
}

function getsankeyenergydetails(region, year, flow, units)
{
    var details = [];
    var flowtypes = getflowtypes(flow);
    for (var i = 0; i < flowtypes.length; i++)
    {
        var r = new Object();
        var flow = flowtypes[i];
        var value = year[flow];
        r['name'] = flow;
        r['value'] = Math.round(units.mult * value);
        r['units'] = units.units;
        r['description'] = getdescription(flow);
        r['children'] = [];
        details.push(r);
    }
    return details;
}
