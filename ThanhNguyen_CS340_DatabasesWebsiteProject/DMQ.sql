/*******************************************************************************
** File Name: Sustainable Technology Database Data Manipulation Queries
** Author: Matt Byrne and Thanh Nguyen
** Date: 3/17/2019
** Description: This file contains the SQL queries for manipulating the
** Sustainable Technology Database according to the requirements set forth in
** the Project Guide.
*******************************************************************************/

/*display data from `EnergySource table`*/
SELECT * FROM `EnergySource`;

/*display data from `EnergyTechnology table`*/
SELECT * FROM `EnergyTechnology`;

/*display data from `Company table`*/
SELECT * FROM `Company`;

/*display data from `SustainableProduct table`*/
SELECT * FROM `SustainableProduct`;

/*display data from `Region table`*/
SELECT * FROM `Region`;

/*add a row of data to `EnergySource`*/
INSERT INTO `EnergySource` (`name`, `percent_global_power`, `annual_growth`, `cost_per_kWh`)
VALUES (:nameInp, :pgpInp, :agInp, :cpk);

/*add a row of data to `EnergyTechnology`*/
INSERT INTO `EnergyTechnology` (`name`, `cost_per_watt`, `development_stage`, `energy_src_id`)
VALUES (:name, :cpw, devStage, energySrc);

/*add a row of data to `Company`*/
INSERT INTO `Company` (`name`, `annual_revenue`, `annual_growth`)
VALUES (:name, :annualRev, annualGrow);

/*add a row of data to `SustainableProduct`*/
INSERT INTO `SustainableProduct` (`name`, `cost_per_unit`, `sector`)
VALUES (:name, :cpu, sect);

/*add a row of data to `Region`*/
INSERT INTO `Region` (`name`, `population`, `country`, `continent`)
VALUES (:name, :pop, :country, :continent);

/*update a row of the Company table with new data*/
UPDATE `Company`
SET `name` = :name, `annual_revenue` = :annualRev, `annual_growth` = :annualGrow
WHERE `id` = :compID;

/*delete a row from the Company table*/
DELETE FROM `Company` WHERE `id` = :compID;

/*add to Energy-Region relationship*/
INSERT INTO `Energy_Region` (`energy_src_id`, `region_id`)
VALUES (:enID, :regID);

/*add to Energy-Company relationship*/
INSERT INTO `Energy_Company` (`energy_src_id`, `company_id`)
VALUES (:enID, :compID);

/*Add to Company-Product relationship*/
INSERT INTO `Company_Product` (`company_id`, `product_id`)
VALUES (:compID, :prodID);

/*Remove from Energy-Region relationship*/
DELETE FROM `Energy_Region` WHERE `energy_src_id` = :enID AND `region_id` = regID;

/*Remove from Energy-Company relationship*/
DELETE FROM `Energy_Company` WHERE `energy_src_id` = :enID AND `company_id` = compID;

/* Remove from Company-Product relationship*/
DELETE FROM `Company_Product` WHERE `company_id` = :compID AND `product_id` = :prodID;

/*Add to EnergyTech-EnergySource relationship*/
UPDATE `EnergyTechnology`
SET `energy_rc_id` = :enSrc
WHERE `id` = :enTechID;

/*Remove from EnergyTech-EnergySource relationship*/
UPDATE `EnergyTechnology`
SET `energy_src_id` = NULL
WHERE `id` = :enTechID;

/*Perform search in EnergyTechnology table*/
SELECT * FROM `EnergyTechnology`
WHERE `id` = :searchString OR `name` = :searchString OR `cost_per_watt` = :searchString
OR `development_stage` = :searchString OR `energy_src_id` = :searchString;
