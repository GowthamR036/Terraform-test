package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"encoding/json"

	"github.com/hashicorp/go-version"
	"github.com/hashicorp/hc-install/product"
	"github.com/hashicorp/hc-install/releases"
	"github.com/hashicorp/terraform-exec/tfexec"
)

type ResourceGroup struct {
	Name string `json:"name"`
	Location string `json:"location"`
}



func createResourceGroup(payload *ResourceGroup){
	installer := &releases.ExactVersion{
		Product: product.Terraform,
		Version: version.Must(version.NewVersion("1.0.6")),
	}

	log.Print(payload.Name +" "+payload.Location)
	log.Print("Terraform installation done")
	execPath, err := installer.Install(context.Background())
	if err != nil {
		log.Fatalf("error installing Terraform: %s", err)
	}

	log.Print("Environment setting for terraform")
	workingDir := "../../../../../../../node/resource_group"
	tf, err := tfexec.NewTerraform(workingDir, execPath)
	if err != nil {
		log.Fatalf("error running NewTerraform: %s", err)
	}

	log.Print("Running terraform int")
	err = tf.Init(context.Background(), tfexec.Upgrade(true))
	if err != nil {
		log.Fatalf("error running Init: %s", err)
	}

	name := "name="+ payload.Name
	location := "location=" + payload.Location
	log.Print("Running terraform plan")
	hasChanges, err := tf.Plan(context.Background(), 
									tfexec.Var(name),
									tfexec.Var(location),
							 )
	if err != nil {
		log.Fatalf("error running Show: %s", err)
	}

	if(hasChanges){
		fmt.Println("Plan has a change") 
	}

	log.Print("Running terraform apply")
	err = tf.Apply(context.Background(),
						tfexec.Var(name),
						tfexec.Var(location),
				  )
	if(err != nil){
		log.Fatalf("error running Apply: %s", err)
	}
	log.Print("Resources successfully created")

}

func handler(w http.ResponseWriter, r *http.Request) {
	var req ResourceGroup
    err := json.NewDecoder(r.Body).Decode(&req)
    if(err != nil){
        http.Error(w, err.Error(), 400)
        return
    }
    createResourceGroup(&req)
	w.WriteHeader(http.StatusAccepted)
}

func main() {
    http.HandleFunc("/createResourceGroup", handler)
    log.Fatal(http.ListenAndServe(":8081", nil))
}