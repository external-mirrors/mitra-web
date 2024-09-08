#!/usr/bin/env node

import { exec } from "child_process"

exec(`tar -czvf mitra-web_${process.env.npm_package_version}.tar.gz dist`, (error) => {
  if (error) {
    throw error
  }
})
