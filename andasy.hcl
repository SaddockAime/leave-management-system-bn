# andasy.hcl app configuration file generated for hr-employees-management-bn on Thursday, 05-Mar-26 12:50:30 SAST
#
# See https://github.com/quarksgroup/andasy-cli for information about how to use this file.

app_name = "hr-employees-management-bn"

app {

  env = {
    HOST = "::"
  }

  port = 4000

  compute {
    cpu      = 1
    memory   = 512
    cpu_kind = "shared"
  }

  process {
    name = "hr-employees-management-bn"
  }

}
