-- SQL Script to create the schema and the tables
-- Jeff Liu, May 2020

-- CREATE SCHEMA IF NOT EXISTS `theDartmouth` DEFAULT CHARACTER SET utf8 ;
USE `heroku_0e9c350bac7b354`;

-- -----------------------------------------------------
-- Table `Users`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS Users (
  `UserID` INT NOT NULL AUTO_INCREMENT,
  `Username` VARCHAR(45) NULL,
  `HashedPassword` VARCHAR(100) NULL,
  PRIMARY KEY (`UserID`)
  );

-- -----------------------------------------------------
-- Table `SavedTags`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `SavedTags` (
  `TagID` INT NOT NULL AUTO_INCREMENT,
  `TagString` VARCHAR(45) NULL,
  `UserID` INT NOT NULL,
  PRIMARY KEY (`TagID`, `UserID`),
  CONSTRAINT `fk_SavedTags_Users`
    FOREIGN KEY (`UserID`)
    REFERENCES `Users` (`UserID`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION);

-- -----------------------------------------------------
-- Table `SavedAuthors`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `SavedAuthors` (
  `AuthorID` INT NOT NULL AUTO_INCREMENT,
  `AuthorName` VARCHAR(60) NULL,
  `UserID` INT NOT NULL,
  PRIMARY KEY (`AuthorID`, `UserID`),
  CONSTRAINT `fk_SavedAuthors_Users1`
    FOREIGN KEY (`UserID`)
    REFERENCES `Users` (`UserID`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION);

SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
