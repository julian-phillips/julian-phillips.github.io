

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
        var r = new Object();
        r['name'] = region;
        r['year'] = year;
        r['selected'] = (year == selectedyear) ? 'Y' : 'N';
        if (year >= minyear && year <= maxyear)
        {
            var facts = data[region][year];
            r['population'] = facts.population;
            var units = getunits(valuetype, r.population);
            r['electricity'] = (units.mult * facts.electricity);
            r['units'] = units.units;
        }
        else
        {
            r['population'] = "";
            r['electricity'] = "";
            r['units'] = "";
        }
        wheeldata.push(r);
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
    var padding = 3
    var start = minyear - padding;
    var end = maxyear + padding;
    if (adjoining >= 0)
    {
        // start = Math.max(selectedyear - adjoining, minyear);
        // end =   Math.min(selectedyear + adjoining, maxyear);
        start = selectedyear - adjoining;
        end =   selectedyear + adjoining;
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
            p = (level[i]['value'] / total * target);
        }
        level[i]['percent'] = p;
        var children = level[i]['children'];
        if (typeof children == 'object' && children.length > 0)
        {
            setpercent(children, p);
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
            r['renewable'] = (units.mult * facts.renewable);
            r['nonrenewable'] = (units.mult * facts.nonrenewable);
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
        if (facts[flow] > 0)
        {
            details.push({
                "name": key,
                "value": (units.mult * facts[flow]),
                "units": units.units,
                "desc": getdescription(flow)
            });
        }
    }
    r["details"] = details;
    return r;
}


var SankeyObj = function(otype)
{
    this.otype = otype; // 'energy' or 'region'
    this.georegion = '';
    this.flow = '';
    this.name = '';
    this.description = '';
    this.year = '';
    this.value = 0;
    this.units = '';
    this.percent = 0;
    this.ctype = ''; // type of child objects
    this.children = [];
}
var SankeyObjMin = function(o)
{
    this.name = o.name
    this.description = o.description;
    this.value = o.value;
    this.percent = o.percent;
    this.children = o.children;
}


function getsankeydata(name, selectedyear, valuetype, flow, hierarchy, maxlevels)
{
    var sankeydata = [];

    var region = data[name];
    var flowgroups = getflowgroups(flow);
    var sankeydata = [];

    if (hierarchy == 'energy')
    {
        var yeardata = data[name][selectedyear];
        var units = getunits(valuetype, yeardata.population);

        for (var i = 0; i < flowgroups.length; i++)
        {
            var cflow = flowgroups[i];
            if (yeardata[cflow] > 0)  // exclude records with zero value
            {
                var r = new SankeyObj('energy');
                r.georegion = name;
                r.flow = cflow;
                r.name = name;
                r.description = getdescription(cflow);
                r.year = selectedyear;
                r.value = (units.mult * yeardata[cflow]);
                r.units = units.units;
                r.children = getsankeychildrenregions(r, cflow, units);
                r.ctype = 'region';
                sankeydata.push(r);
            }
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
            // this is a country, list is empty
            regionlist = [];
            var yeardata = data[name][selectedyear];
            var units = getunits(valuetype, yeardata.population);
            var r = new SankeyObj('region');
            r.georegtion = name;
            r.flow = flow;
            r.name = name;
            r.year = selectedyear;
            sankeydata = getsankeychildrenenergy(r, units);
        }
        for (var i = 0; i < regionlist.length; i++)
        {
            var cflow = 'electricity';
            var cregion = regionlist[i];
            var yeardata = data[cregion][selectedyear];
            if (yeardata[cflow] > 0) // exclude records with zero value
            {
                var units = getunits(valuetype, yeardata.population);
                var description = getdescription(cflow);
                var r = new SankeyObj('region');
                r.georegion = name;
                r.flow = flow;
                r.name = cregion;
                r.year = selectedyear;
                r.value = (units.mult * yeardata[cflow]);
                r.units = units.units;
                r.description = description;
                r.children = getsankeychildrenenergy(r, units);
                r.ctype = 'energy';
                sankeydata.push(r);
            }
        }
    }
    setpercent(sankeydata, 100);
    var tmp = new SankeyObj(hierarchy);
    tmp.georegion = name;
    tmp.flow = flow;
    tmp.year = selectedyear;
    tmp.units = getunits(valuetype, 1).units;
    // collapse small percentage records into an aggregate record
    sankeydata = aggregate(sankeydata, tmp);
    //    return sankeydata;
    return simplify(sankeydata);
}

function simplify(o)
{
    for (var i = 0; i < o.length; i++)
    {
        var v = o[i];
        if (typeof v.children == 'object' && v.children.length > 0)        {
            v.children = simplify(v.children);
        }
    }
    var newlist = [];
    for (var i = 0; i < o.length; i++)
    {
        newlist.push(new SankeyObjMin(o[i]));
    }
    return newlist;
}
var lowthreshold = 2; // minimum percent value, anything less gets aggregated
var maxsankey = 5; // maximum number of individual records to display, aggregate the rest
function aggregate(o, proto)
{
    for (var i = 0; i < o.length; i++)
    {
        var v = o[i];
        if (typeof v.children == 'object' && v.children.length > 0)
        {
            v.children = aggregate(v.children, v);
        }
    }
    // sort in order of percent
    o.sort(sortbypercent);
    var newlist = [];
    var r = new SankeyObj(proto.otype);
    r.georegion = proto.georegion;
    r.flow = proto.flow;
    r.name = 'Other';
    r.year = proto.year;
    r.units = proto.units;
    for (var i = 0; i < o.length; i++)
    {
        var v = o[i];
        var p = v.percent;
        if (p < lowthreshold || i >= maxsankey)
        {
            r.value += v.value;
            r.description += (r.description == '') ? v.name : ', ' + v.name;
            r.percent += v.percent;
        }
        else
        {
            newlist.push(v);
        }
        v.percent = v.percent.toFixed(2);
    }
    if (r.value > 0)
    {
        r.percent = r.percent.toFixed(2);
        newlist.push(r);
    }
    return newlist;
}

function sortbypercent(x, y)
{
    // sort by 'percent' field in decreasing order
    return (sortby(x, y, 'percent') * -1);
}

function sortby(x, y, field)
{
    var xp = x[field];
    var yp = y[field];
    r = 0; // default is equals
    if (xp < yp)
    {
        r = -1;
    }
    else if (xp > yp)
    {
        r = 1;
    }
    return r;
}

function getsankeychildrenenergy(parent, units)
{
    var children = [];
    var region = data[parent.name];
    var flowgroups = getflowgroups(parent.flow);
    var yeardata = data[parent.name][parent.year];
    for (var i = 0; i < flowgroups.length; i++)
    {
        var flow = flowgroups[i];
        if (yeardata[flow] > 0) // exclude records with zero value
        {
            var r = new SankeyObj('energy');
            r.georegion = parent.name;
            r.flow = flow;
            r.name = flow;
            r.year = parent.year;
            r.value = (units.mult * yeardata[flow]);
            r.units = units.units;
            r.description = getdescription(flow);
            r.children = getsankeyenergydetails(r, region, yeardata, flow, units);
            //r.children = getsankeychildrenregions(r, flow, units);
            r.ctype = 'energy';
            children.push(r);
        }
    }
    return children;
}

function getsankeychildrenregions(parent, flow, units)
{
    
    var children = [];
    var regionlist = [];
    var region = data[parent.georegion];
    if (region.isregion == 'Y')
    {
        regionlist = Object.keys(regions[parent.name]).sort();
    }
    else if (region.issubregion == 'Y')
    {
        regionlist = regions[region['region']][parent.name]; // this is confusing
    }
    else
    {
        // this is a country, no further details necessary
        regionlist = [];
    }
    for (i = 0; i < regionlist.length; i++)
    {
        var name = regionlist[i];
        var cregion = data[name];
        var yeardata = data[name][parent.year];
        if (yeardata[flow] > 0) // exclude records with zero value
        {
            var r = new SankeyObj('region');
            r.georegion = name;
            r.flow = parent.flow
            r.name = name;
            r.year = parent.year;
            r.value = (units.mult * yeardata[flow]);
            r.units = units.units;
            r.description = getdescription(flow);
            r.children = getsankeyenergydetails(r, cregion, yeardata, flow, units);
            r.ctype = 'energy';
            children.push(r);
        }
    }
    return children;
}

function getsankeyenergydetails(parent, region, yeardata, flow, units)
{
    var details = [];
    var flowtypes = getflowtypes(flow);
    for (var i = 0; i < flowtypes.length; i++)
    {
        var flow = flowtypes[i];
        if (yeardata[flow] > 0) // exclude records with zero value
        {
            var r = new SankeyObj('energy');
            r.georegion = parent.georegion;
            r.flow = flow;
            r.name = flow;
            r.description = getdescription(flow);
            r.year = parent.year;
            r.value = (units.mult * yeardata[flow]);
            r.units = units.units;
            details.push(r);
        }
    }
    return details;
}
