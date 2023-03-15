import logging
import azure.functions as func
import os
from dependencies.tfpython import *
import json
from typing import Optional
import sys

def initTerraform(pathToTfCode:str, tfBinPath:str):
  tf = Terraform(working_dir = pathToTfCode, terraform_bin_path=tfBinPath)
  initReturnCode, initOutput, initError = tf.init()
  return tf, initReturnCode, initError

def response(msg:str, status_code:int,  error:Optional[str] = None):
  res = {"message":msg}
  if error:
    res["error"] = error
  return func.HttpResponse(json.dumps(res), status_code = status_code)

def main(req: func.HttpRequest,context:func.Context) -> func.HttpResponse:
  tfcodePath = "/tfcode"
  tfBinPath = "../dependencies/terraform"
  
  if not req.params.get("client_id") or  not req.params.get("client_secret") or  not req.params.get("subscription_id")  or not req.params.get("tenant_id"):
    return func.HttpResponse("query params missing", status_code = 404)

  os.environ['ARM_CLIENT_ID'] = req.params["client_id"]
  os.environ['ARM_CLIENT_SECRET'] = req.params["client_secret"]
  os.environ['ARM_SUBSCRIPTION_ID'] = req.params["subscription_id"]
  os.environ['ARM_TENANT_ID'] = req.params["tenant_id"]

  # if req.get_json() == None:
  try:
    bodyJson = req.get_json()
  except Exception as e:
    return response("Missing request body", 400)
    
  
  if not bodyJson.get('name') or not bodyJson.get('location'):
    return response("Name or location of resource group is missing", 400)

  absPathToTf = "/".join([str(context.function_directory), tfBinPath])
  try:
    tf, initReturnCode, initError = initTerraform(pathToTfCode= tfcodePath,tfBinPath = absPathToTf)
    
  except Exception as e:
    print(e)
    return response("Init failed",500, str(e))

  tfInput = {"name":bodyJson.get("name"), "location":bodyJson.get("location")}

  if req.method == "POST":
    try:
      planReturnCode, planOutput, planError = tf.plan(var=tfInput)
    except Exception as e:
      return resposne("Plan failed", 500, str(e))
    
    try:
      applyReturnCode, applyOutput, applyError = tf.apply(var=tfInput)
      return response("Resource group created successfully", 200)
    except Exception as e:
      return resposne("Apply failed", 500, str(e))
  
  elif req.method == "DELETE":
    try:
      destroyReturnCode, destroyOutput, destroyError = tf.destroy(var=tfInput)
      return response("Resource group deleted successfully", 200)
    except Exception as e:
      return response("Destroy Failed", 500, str(e))

  return response("Invalid method", 405, "Supported methods are POST and DELETE.")
