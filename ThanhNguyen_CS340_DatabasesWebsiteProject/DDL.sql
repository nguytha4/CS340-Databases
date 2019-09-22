/*******************************************************************************
** File Name: Sustainable Technology Database Data Definition Language
** Author: Matt Byrne and Thanh Nguyen
** Date: 3/17/2019
** Description: This file contains the SQL queries for creating the
** Sustainable Technology Database in MySQL and inserting sample data
** according to the requirements set forth in the Project Guide.
*******************************************************************************/

/*if tables already exist in database, delete them*/
DROP TABLE IF EXISTS `EnergyTechnology`;
DROP TABLE IF EXISTS `Energy_Region`;
DROP TABLE IF EXISTS `Energy_Company`;
DROP TABLE IF EXISTS `Company_Product`;
DROP TABLE IF EXISTS `EnergySource`;
DROP TABLE IF EXISTS `Company`;
DROP TABLE IF EXISTS `SustainableProduct`;
DROP TABLE IF EXISTS `Region`;

/*create the eight tables that constitute the database*/
CREATE TABLE `EnergySource` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `name` varchar(20) NOT NULL,
    `percent_global_power` int(3),
    `annual_growth` int(3),
    `cost_per_kWh` int(11),
    PRIMARY KEY (`id`),
    CONSTRAINT `chk_percent_global` CHECK ((percent_global_power >= 0 AND
    percent_global_power <= 100) OR percent_global_power IS NULL),
    CONSTRAINT `chk_growth` CHECK ((annual_growth >= 0 AND
    annual_growth <= 100) OR annual_growth IS NULL),
    CONSTRAINT `chk_cost` CHECK ((cost_per_kWh > 0) OR cost_per_kWh IS NULL)
) ENGINE = InnoDB;

CREATE TABLE `EnergyTechnology` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `name` varchar(100) NOT NULL,
    `cost_per_watt` float(4, 2),
    `development_stage` varchar(20) DEFAULT 'Theoretical',
    `energy_src_id` int(11),
    PRIMARY KEY (`id`),
    CONSTRAINT `chk_cost_per` CHECK (cost_per_watt > 0 OR cost_per_watt IS NULL),
    CONSTRAINT `chk_dev_stage` CHECK (development_stage = 'Theoretical' OR
    development_stage = "Experimental" OR development_stage = "Pilot-stage" OR
    development_stage = "Commercial" OR development_stage = "Utility-scale"),
    CONSTRAINT `EnergyTechnology_fk` FOREIGN KEY (`energy_src_id`) REFERENCES
    `EnergySource` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE = InnoDB;

CREATE TABLE `Company` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `name` varchar(100) NOT NULL,
    `annual_revenue` int(11),
    `annual_growth` int(20),
    PRIMARY KEY (`id`),
    CONSTRAINT `chk_rev` CHECK (annual_revenue >= 0 OR annual_revenue IS NULL)
) ENGINE = InnoDB;

CREATE TABLE `SustainableProduct` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `name` varchar(100) NOT NULL,
    `cost_per_unit` int(11),
    `sector` varchar(50),
    PRIMARY KEY (`id`),
    CONSTRAINT `chk_cost_unit` CHECK (cost_per_unit >= 0 OR cost_per_unit IS NULL)
) ENGINE = InnoDB;

CREATE TABLE `Region` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `name` varchar(20) NOT NULL,
    `population` int(11),
    `country` varchar(50) NOT NULL,
    `continent` varchar(20),
    PRIMARY KEY (`id`),
    CONSTRAINT `chk_continent` CHECK (continent = 'Africa' OR continent =
    'Antarctica' OR continent = 'Asia' OR continent = 'Australia' OR continent
    = 'Europe' OR continent = 'North America' OR continent = 'Oceania' OR
    continent = 'South America')
) ENGINE = InnoDB;

CREATE TABLE `Energy_Region` (
    `energy_src_id` int(11) NOT NULL,
    `region_id` int(11) NOT NULL,
    PRIMARY KEY (`energy_src_id`, `region_id`),
    CONSTRAINT `energy_fk1` FOREIGN KEY (`energy_src_id`) REFERENCES `EnergySource` (`id`) ON DELETE CASCADE,
    CONSTRAINT `region_fk` FOREIGN KEY (`region_id`) REFERENCES `Region` (`id`) ON DELETE CASCADE
) ENGINE = InnoDB;

CREATE TABLE `Energy_Company` (
    `energy_src_id` int(11) NOT NULL,
    `company_id` int(11) NOT NULL,
    PRIMARY KEY (`energy_src_id`, `company_id`),
    CONSTRAINT `energy_fk2` FOREIGN KEY (`energy_src_id`) REFERENCES `EnergySource` (`id`) ON DELETE CASCADE,
    CONSTRAINT `company_fk1` FOREIGN KEY (`company_id`) REFERENCES `Company` (`id`) ON DELETE CASCADE
) ENGINE = InnoDB;

CREATE TABLE `Company_Product` (
    `company_id` int(11) NOT NULL,
    `product_id` int(11) NOT NULL,
    PRIMARY KEY (`company_id`, `product_id`),
    CONSTRAINT `company_fk2` FOREIGN KEY (`company_id`) REFERENCES `Company` (`id`) ON DELETE CASCADE,
    CONSTRAINT `product_fk` FOREIGN KEY (`product_id`) REFERENCES `SustainableProduct` (`id`) ON DELETE CASCADE
) ENGINE = InnoDB;

/*code for dropping table if already found in database sourced from:
https://stackoverflow.com/questions/7887011/how-to-drop-a-table-if-it-exists-in-sql-server/33497857#33497857

code for using constraints to restrict value input sourced from:
https://stackoverflow.com/questions/2441427/restrict-varchar-column-to-specific-values

--code for creating many-to-many relationship tables sourced from:
--https://stackoverflow.com/questions/260441/how-to-create-relationships-in-mysql*/

/*insert sample data into the database*/
INSERT INTO `EnergySource` (`name`, `percent_global_power`, `annual_growth`, `cost_per_kWh`)
VALUES ('Solar', 7, 34, 7);

--percent_global_power figure sourced from:
--https://www.c2es.org/content/renewable-energy/

--annual growth figure sourced from:
--http://www.iea-pvps.org/fileadmin/dam/public/report/statistics/IEA-PVPS_-_A_Snapshot_of_Global_PV_-_1992-2016__1_.pdf

--cost_per_kWh figure sourced from:
--https://www.solar-estimate.org/news/2018-03-08-how-are-solar-panels-changing-america

INSERT INTO `EnergyTechnology` (`name`, `development_stage`, `cost_per_watt`, `energy_src_id`)
VALUES ('Photovoltaic Array', 'Commercial', 3, 1);

--cost_per_watt figure sourced from:
--https://news.energysage.com/3-kw-solar-panel-systems-prices-installers/

INSERT INTO `Company` (`name`, `annual_revenue`, `annual_growth`)
VALUES ('SolarCity', 730000000, 30);

--annual_revenue figure sourced from:
--https://csimarket.com/stocks/single_growth_rates.php?code=SCTY&rev

--annual_growth figures sourced from:
--https://www.forbes.com/sites/greatspeculations/2018/09/25/two-years-in-teslas-solarcity-deal-looks-increasingly-like-a-bad-bet/#79108d7e877f

INSERT INTO `SustainableProduct` (`name`, `cost_per_unit`, `sector`)
VALUES ('Home Battery', 3400, 'Household Consumer Product');

--cost_per_unit figure sourced from:
--https://www.solar-estimate.org/news/2018-03-12-is-the-tesla-powerwall-2-worth-buying-and-how-it-compares-to-other-storage

INSERT INTO `Region` (`name`, `population`, `country`, `continent`)
VALUES ('Southern California', 23800000, 'United States', 'North America');

--population figure sourced from:
--https://en.wikipedia.org/wiki/Southern_California
