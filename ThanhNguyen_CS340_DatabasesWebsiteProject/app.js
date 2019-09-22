/*******************************************************************************
** File Name: Sustainable Technology Database Server-Side Scripting
** Author: Matt Byrne and Thanh Nguyen
** Date: 3/17/2019
** Description: This file contains the GET and POST handlers that implement the
** server-side operations for the Sustainable Technology Database.
*******************************************************************************/

/*The GET and POST handlers in this file were written with the help of the following sources:
"Form Processing" section of
"Form Handling" lecture page at:
http://eecs.oregonstate.edu/ecampus-video/CS290/core-content/hello-node/express-forms.html
in addition to code written for the CS 290 Final Assignment (taken in Fall 2018)*/
/*The SQL syntax was created referencing the following sources:
"Making Queries", "Inserting Data", "Selecting Data", and "Deleting" sections of "Using MySQL with Node" lecture page at:
http://eecs.oregonstate.edu/ecampus-video/CS290/core-content/node-mysql/using-server-sql.html
in addition to code written for the CS 290 Final Assignment (taken in Fall 2018)*/

var express = require('express');
var bodyParser = require('body-parser');
var mysql = require('./dbcon.js');

var app = express();
var handlebars = require('express-handlebars').create({defaultLayout:'main'});

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.set('port', 24505);

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use(express.static('scripts'));

app.get('/',function(req, res, next){
    var context = {};
    res.render('splash', context);
});

//Display EnergySource entries
app.get('/EnergySource', function(req, res, next){
    var context = {array: null};
    mysql.pool.query('SELECT * FROM EnergySource', function(err, rows, fields){
        if(err){
            next(err);
            return;
        }
        context.array = rows;
        res.render('EnergySource', context);
    });
});

//Insert EnergySource records or add/remove to/from EnergySource relationships
app.post('/EnergySource', function(req, res, next) {
    var context = {array: null, badData: null, relRegAdded: null, relCompAdded: null};
    if (req.body.type === "insert" && (req.body.pgp >= 0 && req.body.pgp <= 100) &&
    ((req.body.ag >= 0 && req.body.ag <= 100) || req.body.ag == null) && (req.body.ckWh > 0
    || req.body.ckWh == null)) {
        mysql.pool.query("INSERT INTO EnergySource(`name`, `percent_global_power`,`annual_growth`, `cost_per_kWh`) VALUES (?, ?, ?, ?)",
        [req.body.name, req.body.pgp, req.body.ag, req.body.ckWh], function(err, result) {
            if (err) {
                next(err);
                return;
            }
            mysql.pool.query('SELECT * FROM EnergySource', function(err, rows, fields) {
                if (err) {
                    next(err);
                    return;
                }
                context.array = rows;
                res.render('EnergySource', context);
            });
        });
    }
    else if (req.body.type === "insert") {
        mysql.pool.query('SELECT * FROM EnergySource', function(err, rows, fields) {
            if (err) {
                next(err);
                return;
            }
            context.array = rows;
            context.badData = "Invalid data: percent_global_power/annual_growth must be between 0 and 100; cost_per_kWh must be >0 or blank";
            res.render('EnergySource', context);
        });
    }
    else if (req.body.type === "addRelReg") {
        mysql.pool.query("INSERT INTO Energy_Region(`energy_src_id`, `region_id`) VALUES (?, ?)",
        [req.body.es_id, req.body.r_id], function(err, result) {
            if (err) {
                mysql.pool.query('SELECT * FROM EnergySource', function(err, rows, fields) {
                    if (err) {
                        next(err);
                        return;
                    }
                    context.array = rows;
                    context.relRegAdded = "Invalid data: please enter the id of an existing region that is not already in a relationship with the selected energy source";
                    res.render('EnergySource', context);
                });
                return;
            }
            mysql.pool.query('SELECT * FROM EnergySource', function(err, rows, fields) {
                if (err) {
                    next(err);
                    return;
                }
                context.array = rows;
                context.relRegAdded = "Added to EnergySource-Region relationship";
                res.render('EnergySource', context);
            });
        });
    }
    else if (req.body.type === "addRelComp") {
        mysql.pool.query("INSERT INTO Energy_Company(`energy_src_id`, `company_id`) VALUES (?, ?)",
        [req.body.es_id, req.body.c_id], function(err, result) {
            if (err) {
                mysql.pool.query('SELECT * FROM EnergySource', function(err, rows, fields) {
                    if (err) {
                        next(err);
                        return;
                    }
                    context.array = rows;
                    context.relCompAdded = "Invalid data: please enter the id of an existing company that is not already in a relationship with the selected energy source";
                    res.render('EnergySource', context);
                });
                return;
            }
            mysql.pool.query('SELECT * FROM EnergySource', function(err, rows, fields) {
                if (err) {
                    next(err);
                    return;
                }
                context.array = rows;
                context.relCompAdded = "Added to EnergySource-Company relationship";
                res.render('EnergySource', context);
            });
        });
    }
    else if (req.body.type === "remRelReg") {
        mysql.pool.query("DELETE FROM Energy_Region WHERE `energy_src_id` = ? AND `region_id` = ?",
        [req.body.es_id, req.body.r_id], function(err, result) {
            if (err) {
                next(err);
                return;
            }
            mysql.pool.query('SELECT * FROM EnergySource', function(err, rows, fields) {
                if (err) {
                    next(err);
                    return;
                }
                context.array = rows;
                context.relRegDeleted = "Removed from EnergySource-Region relationship";
                res.render('EnergySource', context);
            });
        });
    }
});

//Display EnergyTechnology entries
app.get('/EnergyTech',function(req, res, next){
    var context = {array: null};
    mysql.pool.query('SELECT * FROM EnergyTechnology', function(err, rows, fields){
        if(err){
            next(err);
            return;
        }
        context.array = rows;
        res.render('EnergyTech', context);
    });
});

//Insert EnergyTechnology records or add/remove to/from EnergyTechnology relationships
app.post('/EnergyTech', function(req, res, next) {
    var context = {array: null, badData: null, relESadded: null};
    if (req.body.type === "insert" && (req.body.cpw > 0 || req.body.cpw == null) &&
    (req.body.ds == "Theoretical" || req.body.ds == "Experimental" || req.body.ds == "Pilot-stage"
    || req.body.ds == "Commercial" || req.body.ds == "Utility-scale")) {
        mysql.pool.query('INSERT INTO EnergyTechnology(`name`, `cost_per_watt`,`development_stage`, `energy_src_id`) VALUES (?, ?, ?, ?)',
        [req.body.name, req.body.cpw, req.body.ds, req.body.es], function(err, result) {
            if (err) {
                next(err);
                return;
            }
            mysql.pool.query('SELECT * FROM EnergyTechnology', function(err, rows, fields) {
                if (err) {
                    next(err);
                    return;
                }
                context.array = rows;
                res.render('EnergyTech', context);
            });
        });
    }
    else if (req.body.type === "insert") {
        mysql.pool.query('SELECT * FROM EnergyTechnology', function(err, rows, fields) {
            if (err) {
                next(err);
                return;
            }
            context.array = rows;
            context.badData = "Invalid data: cost_per_watt must be > 0 or blank; development_stage must be 'Theroetical', 'Experimental', 'Pilot-stage', 'Commercial', or 'Utility-scale'";
            res.render('EnergyTech', context);
        });
    }
    else if (req.body.type === "addRelES") {
        mysql.pool.query("UPDATE EnergyTechnology SET `energy_src_id` = ? WHERE `id` = ?",
        [req.body.es_id, req.body.et_id], function(err, result) {
            if (err) {
                mysql.pool.query('SELECT * FROM EnergyTechnology', function(err, rows, fields) {
                    if (err) {
                        next(err);
                        return;
                    }
                    context.array = rows;
                    context.relESAdded = "Invalid data: please enter the id of an existing energy source that is not already in a relationship with the selected energy technology";
                    res.render('EnergyTech', context);
                });
                return;
            }
            mysql.pool.query('SELECT * FROM EnergyTechnology', function(err, rows, fields) {
                if (err) {
                    next(err);
                    return;
                }
                context.array = rows;
                context.relESAdded = "Added to EnergySource-EnergyTechnology relationship";
                res.render('EnergyTech', context);
            });
        });
    }
    else if (req.body.type === "delRelES") {
        mysql.pool.query("UPDATE EnergyTechnology SET `energy_src_id` = NULL WHERE `id` = ?",
        [req.body.et_id], function(err, result) {
            if (err) {
                next(err);
                return;
            }
            mysql.pool.query('SELECT * FROM EnergyTechnology', function(err, rows, fields) {
                if (err) {
                    next(err);
                    return;
                }
                context.array = rows;
                context.relESDeleted = "Removed from EnergySource-EnergyTechnology relationship";
                res.render('EnergyTech', context);
            });
        });
    }
    else if (req.body.type === "search") {
        mysql.pool.query("SELECT * FROM EnergyTechnology WHERE `name` = ? OR `cost_per_watt` = ? OR `development_stage` = ? OR `energy_src_id` = ?",
        [req.body.string, req.body.string, req.body.string, req.body.string], function(err, rows, fields) {
            if (err) {
                next(err);
                return;
            }
            context.array = rows;
            res.render('EnergyTech', context);
        });
    }
});

//Display SustainableProduct entries
app.get('/SustainableProd',function(req, res, next){
    var context = {array: null};
    mysql.pool.query('SELECT * FROM SustainableProduct', function(err, rows, fields){
        if(err){
            next(err);
            return;
        }
        context.array = rows;
        res.render('SustainableProd', context);
    });
});

//Insert SustainableProduct records or add to SustainableProduct relationship
app.post('/SustainableProd', function(req, res, next) {
    var context = {array: null, badData: null, relCompAdded: null};
    if (req.body.type === "insert" && (req.body.cpu > 0 || req.body.cpu == null)) {
        mysql.pool.query("INSERT INTO SustainableProduct(`name`, `cost_per_unit`,`sector`) VALUES (?, ?, ?)",
        [req.body.name, req.body.cpu, req.body.sec], function(err, result) {
            if (err) {
                next(err);
                return;
            }
            mysql.pool.query('SELECT * FROM SustainableProduct', function(err, rows, fields) {
                if (err) {
                    next(err);
                    return;
                }
                context.array = rows;
                res.render('SustainableProd', context);
            });
        });
    }
    else if (req.body.type === "insert") {
        mysql.pool.query('SELECT * FROM SustainableProduct', function(err, rows, fields) {
            if (err) {
                next(err);
                return;
            }
            context.array = rows;
            context.badData = "Invalid data: cost_per_unit must be > 0 or blank"
            res.render('SustainableProd', context);
        });
    }
    else if (req.body.type === "addRelComp") {
        mysql.pool.query("INSERT INTO Company_Product(`product_id`, `company_id`) VALUES (?, ?)",
        [req.body.sp_id, req.body.c_id], function(err, result) {
            if (err) {
                mysql.pool.query('SELECT * FROM SustainableProduct', function(err, rows, fields) {
                    if (err) {
                        next(err);
                        return;
                    }
                    context.array = rows;
                    context.relCompAdded = "Invalid data: please enter the id of an existing company that is not already in a relationship with the selected sustainability product";
                    res.render('SustainableProd', context);
                });
                return;
            }
            mysql.pool.query('SELECT * FROM SustainableProduct', function(err, rows, fields) {
                if (err) {
                    next(err);
                    return;
                }
                context.array = rows;
                context.relCompAdded = "Added to Company-SustainableProduct relationship";
                res.render('SustainableProd', context);
            });
        });
    }
})

//Display Company entries
app.get('/Company',function(req, res, next){
    var context = {array: null};
    mysql.pool.query('SELECT * FROM Company', function(err, rows, fields){
        if(err){
            next(err);
            return;
        }
        context.array = rows;
        res.render('Company', context);
    });
});

//Insert Company records, add to Company relationship, update Company records, or delete Company records
app.post('/Company', function(req, res, next) {
    var context = {array: null, relESAdded: null, relProdAdded: null};
    if (req.body.type === "insert" && (req.body.ar > 0 || req.body.ar == null)) {
        mysql.pool.query("INSERT INTO Company(`name`, `annual_revenue`,`annual_growth`) VALUES (?, ?, ?)",
        [req.body.name, req.body.ar, req.body.ag], function(err, result) {
            if (err) {
                next(err);
                return;
            }
            mysql.pool.query('SELECT * FROM Company', function(err, rows, fields) {
                if (err) {
                    next(err);
                    return;
                }
                context.array = rows;
                res.render('Company', context);
            });
        });
    }
    else if (req.body.type === "insert") {
        mysql.pool.query('SELECT * FROM Company', function(err, rows, fields) {
            if (err) {
                next(err);
                return;
            }
            context.array = rows;
            context.badData = "Invalid data: annual_revenue must be > 0 or blank";
            res.render('Company', context);
        });
    }
    else if (req.body.type === "addRelES") {
        mysql.pool.query("INSERT INTO Energy_Company(`company_id`, `energy_src_id`) VALUES (?, ?)",
        [req.body.c_id, req.body.es_id], function(err, result) {
            if (err) {
                mysql.pool.query('SELECT * FROM Company', function(err, rows, fields) {
                    if (err) {
                        next(err);
                        return;
                    }
                    context.array = rows;
                    context.relESAdded = "Invalid data: please enter the id of an existing energy source that is not already in a relationship with the selected company";
                    res.render('Company', context);
                });
                return;
            }
            mysql.pool.query('SELECT * FROM Company', function(err, rows, fields) {
                if (err) {
                    next(err);
                    return;
                }
                context.array = rows;
                context.relESAdded = "Added to EnergSource-Company relationship";
                res.render('Company', context);
            });
        });
    }
    else if (req.body.type === "addRelProd") {
        mysql.pool.query("INSERT INTO Company_Product(`company_id`, `product_id`) VALUES (?, ?)",
        [req.body.c_id, req.body.p_id], function(err, result) {
            if (err) {
                mysql.pool.query('SELECT * FROM Company', function(err, rows, fields) {
                    if (err) {
                        next(err);
                        return;
                    }
                    context.array = rows;
                    context.relProdAdded = "Invalid data: please enter the id of an existing sustainability product that is not already in a relationship with the selected company";
                    res.render('Company', context);
                });
                return;
            }
            mysql.pool.query('SELECT * FROM Company', function(err, rows, fields) {
                if (err) {
                    next(err);
                    return;
                }
                context.array = rows;
                context.relProdAdded = "Added to Company-SustainableProduct relationship";
                res.render('Company', context);
            });
        });
    }
    else if (req.body.type === "delete") {
        mysql.pool.query("DELETE FROM Company WHERE `id` = ?",
        [req.body.c_id], function(err, result) {
            if (err) {
                next(err);
                return;
            }
            mysql.pool.query('SELECT * FROM Company', function(err, rows, fields) {
                if (err) {
                    next(err);
                    return;
                }
                context.array = rows;
                res.render('Company', context);
            });
        });
    }
    else if (req.body.type === "update") {
        mysql.pool.query("UPDATE Company SET `name` = ?, `annual_revenue` = ?, `annual_growth` = ? WHERE `id` = ?",
        [req.body.name, req.body.ar, req.body.ag, req.body.c_id], function(err, result) {
            if (err) {
                next(err);
                return;
            }
            mysql.pool.query('SELECT * FROM Company', function(err, rows, fields) {
                if (err) {
                    next(err);
                    return;
                }
                context.array = rows;
                res.render('Company', context);
            });
        });
    }
});

//Accept data to use in Company record update
app.post('/Update', function(req, res, next) {
    var context = {array: null, test: null};
    if (req.body.type === "update" && (req.body.ar > 0 || req.body.ar == null)) {
        mysql.pool.query("SELECT * FROM Company WHERE `id` = ?",
        [req.body.c_id], function(err, rows, fields) {
            if (err) {
                next(err);
                return;
            }
            context.array = rows;
            res.render('Update', context);
        });
    }
});

//Display Region entries
app.get('/Region',function(req, res, next){
    var context = {array: null};
    mysql.pool.query('SELECT * FROM Region', function(err, rows, fields){
        if(err){
            next(err);
            return;
        }
        context.array = rows;
        res.render('Region', context);
    });
});

//Insert Region records or add/remove to/from Region relationship
app.post('/Region', function(req, res, next) {
    var context = {array: null, badData: null, relESAdded: null};
    if (req.body.type === "insert" && (req.body.cont == "Africa" || req.body.cont == "Antarctica"
    || req.body.cont == "Asia" || req.body.cont == "Australia" || req.body.cont == "Europe"
    || req.body.cont == "North America" || req.body.cont == "Oceania" || req.body.cont == "South America")) {
        mysql.pool.query("INSERT INTO Region(`name`, `population`,`country`, `continent`) VALUES (?, ?, ?, ?)",
        [req.body.name, req.body.pop, req.body.cntry, req.body.cont], function(err, result) {
            if (err) {
                next(err);
                return;
            }
            mysql.pool.query('SELECT * FROM Region', function(err, rows, fields) {
                if (err) {
                    next(err);
                    return;
                }
                context.array = rows;
                res.render('Region', context);
            });
        });
    }
    else if (req.body.type === "insert") {
        mysql.pool.query('SELECT * FROM Region', function(err, rows, fields) {
            if (err) {
                next(err);
                return;
            }
            context.array = rows;
            context.badData = "Invalid data: continent must be 'Africa', 'Antarctica', 'Asia', 'Australia', 'Europe', 'North America', 'Oceania', or 'South America'";
            res.render('Region', context);
        });
    }
    else if (req.body.type === "addRelES") {
        mysql.pool.query("INSERT INTO Energy_Region(`region_id`, `energy_src_id`) VALUES (?, ?)",
        [req.body.r_id, req.body.es_id], function(err, result) {
            if (err) {
                mysql.pool.query('SELECT * FROM Region', function(err, rows, fields) {
                    if (err) {
                        next(err);
                        return;
                    }
                    context.array = rows;
                    context.relESAdded = "Invalid data: please enter the id of an existing energy source that is not already in a relationship with the selected region";
                    res.render('Region', context);
                });
                return;
            }
            mysql.pool.query('SELECT * FROM Region', function(err, rows, fields) {
                if (err) {
                    next(err);
                    return;
                }
                context.array = rows;
                context.relESAdded = "Added to EnergySource-Region relationship";
                res.render('Region', context);
            });
        });
    }
    else if (req.body.type === "remRelES") {
        mysql.pool.query("DELETE FROM Energy_Region WHERE `region_id` = ? AND `energy_src_id` = ?",
        [req.body.r_id, req.body.es_id], function(err, result) {
            if (err) {
                mysql.pool.query('SELECT * FROM Region', function(err, rows, fields) {
                    if (err) {
                        next(err);
                        return;
                    }
                    context.array = rows;
                    context.relESDeleted = "Invalid data: please enter the id of an existing energy source that is in a relationship with the selected region";
                    res.render('Region', context);
                });
                return;
            }
            mysql.pool.query('SELECT * FROM Region', function(err, rows, fields) {
                if (err) {
                    next(err);
                    return;
                }
                context.array = rows;
                context.relESDeleted = "Removed from EnergySource-Region relationship";
                res.render('Region', context);
            });
        });
    }
});

//Display 404 error
app.use(function(req,res){
    res.status(404);
    res.render('404');
});

//Display 500 error
app.use(function(err, req, res, next){
    console.error(err.stack);
    res.type('plain/text');
    res.status(500);
    res.render('500');
});

app.listen(app.get('port'), function(){
    console.log('Initiated server on http://localhost:' + app.get('port'));
});
