variable "qtangl_api_url" {
  type    = string
  default = "https://api.qtangl.com"
}

variable "enrollment_token" {
  type      = string
  sensitive = true
}

variable "fleet_size" {
  type    = number
  default = 10
}

resource "null_resource" "qtangl_sensor_fleet" {
  count = var.fleet_size

  provisioner "remote-exec" {
    inline = [
      "curl -fsSL https://releases.qtangl.com/sensor/install.sh | QTANGL_ENROLL_TOKEN=${var.enrollment_token} QTANGL_API_URL=${var.qtangl_api_url} sh",
    ]
  }
}

output "fleet_size" {
  value = var.fleet_size
}
