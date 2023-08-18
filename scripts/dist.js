#!/usr/bin/env node

const { exec } = require('child_process')

exec(`tar -czvf mitra-web_${process.env.npm_package_version}.tar.gz dist`, (error) => {
  if (error) {
    throw error
  }
})
