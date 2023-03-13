terraform {
  backend "azurerm" {
          resource_group_name  = "DefaultResourceGroup-EUS"
          storage_account_name = "poctftest"
          container_name       = "dev"
          key                  = "rg.tfstate"
      }
}