-- SQL Script to create the schema and the tables
-- Jeff Liu, May 2020

-- MySQL Workbench Forward Engineering
SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema theDartmouth
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `theDartmouth` DEFAULT CHARACTER SET utf8 ;
USE `theDartmouth` ;

-- -----------------------------------------------------
-- Table `theDartmouth`.`Users`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `theDartmouth`.`Users` (
  `UserID` INT NOT NULL AUTO_INCREMENT,
  `Username` VARCHAR(45) NULL,
  `HashedPassword` VARCHAR(100) NULL,
  PRIMARY KEY (`UserID`),
  UNIQUE INDEX `Username_UNIQUE` (`Username` ASC) VISIBLE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `theDartmouth`.`SavedTags`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `theDartmouth`.`SavedTags` (
  `TagID` INT NOT NULL AUTO_INCREMENT,
  `TagString` VARCHAR(45) NULL,
  `UserID` INT NOT NULL,
  PRIMARY KEY (`TagID`, `UserID`),
  INDEX `fk_SavedTags_Users_idx` (`UserID` ASC) VISIBLE,
  CONSTRAINT `fk_SavedTags_Users`
    FOREIGN KEY (`UserID`)
    REFERENCES `theDartmouth`.`Users` (`UserID`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `theDartmouth`.`SavedAuthors`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `theDartmouth`.`SavedAuthors` (
  `AuthorID` INT NOT NULL AUTO_INCREMENT,
  `AuthorName` VARCHAR(60) NULL,
  `UserID` INT NOT NULL,
  PRIMARY KEY (`AuthorID`, `UserID`),
  INDEX `fk_SavedAuthors_Users1_idx` (`UserID` ASC) VISIBLE,
  CONSTRAINT `fk_SavedAuthors_Users1`
    FOREIGN KEY (`UserID`)
    REFERENCES `theDartmouth`.`Users` (`UserID`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;


-- -----------------------------------------------------
-- User setup scripts
-- -----------------------------------------------------
create user if not exists 'serverUser'@'localhost' identified by 's3rv3rp4ssw0rd';
grant insert, select, update, delete on theDartmouth.Users to serverUser@'localhost';
grant insert, select, update, delete on theDartmouth.SavedAuthors to serverUser@'localhost';
grant insert, select, update, delete on theDartmouth.SavedTags to serverUser@'localhost';
