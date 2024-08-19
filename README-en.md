# Alibaba Cloud SSO CLI

[![NPM version][npm-image]][npm-url]
[![Node.js CI](https://github.com/aliyun/alibabacloud-sso-cli/actions/workflows/node.js.yml/badge.svg)](https://github.com/aliyun/alibabacloud-sso-cli/actions/workflows/node.js.yml)
[![codecov][cov-image]][cov-url]
[![npm download][download-image]][download-url]

[npm-image]: https://img.shields.io/npm/v/@alicloud/sso-cli.svg?style=flat-square
[npm-url]: https://npmjs.org/package/@alicloud/sso-cli
[cov-image]: https://codecov.io/gh/aliyun/alibabacloud-sso-cli/branch/master/graph/badge.svg
[cov-url]: https://codecov.io/gh/aliyun/alibabacloud-sso-cli
[download-image]: https://img.shields.io/npm/dm/@alicloud/sso-cli.svg?style=flat-square
[download-url]: https://npmjs.org/package/@alicloud/sso-cli

## Installation

> Requires node v16 or higher for ES module support. The latest stable Node.js is recommended.

```sh
npm i @alicloud/sso-cli -g
```

Have a test:

```sh
$ acs-sso
Alibaba Cloud SSO CLI v1.0.0

   help              print help information
   version           print version
   completion        auto completion
   login             login with SSO account
   configure         configure signin url
   profile           list or delete profiles

```

## Usage

### Configure

```sh
acs-sso configure
```

Input your url in the prompt.

```sh
$ acs-sso configure
? please input 'signinUrl': https://signin-******.alibabacloudsso.com/***/login
configuration done!
```

The above url is from the CloudSSO portal as the `signinUrl`. Note: each instance has a different link.

### Login

```sh
acs-sso login
```

If you have multiple accounts or access configurations, `acs-sso` will ask you to select which of accounts and the configs you would like to access with. Once the sign-in is completed, the profile will be linked with the specific account and configuration.

You next login will use the cache StS credentials from your last successful sign-in.

#### Re-Sign-In/Refresh Credentials

Flag `--force` is provided as an option to forcefully refresh the StS credentials.

```sh
acs-sso login --force
```

#### Switch Profile Name

You may use flag `--profile` to save the credentials to a different name, other than `default`.

```sh
acs-sso login --profile user1
```

If flag `--profile` is not provided, the tool uses the same profile from the last successful sign-in.

#### Specify AccountID and Access Configuration

You may explicitly specify the account ID and access configuration with flags `account_id` and `access_config` to sign in with.

```sh
acs-sso login --account_id 1234567890123456 --access_config admin
```

#### Export Credentials

The default sign-in credential output is in JSON format：

```sh
{
  "mode": "StsToken",
  "access_key_id": "STS.NUyPeEoab****",
  "access_key_secret": "GBubpmh****",
  "sts_token": "CAIS****"
}
```

Flag `--env` can convert it to environment variables, which can be exported like this:

```sh
export ALIBABACLOUD_ACCESS_KEY_ID=STS.NUyPeEoab****
export ALIBABACLOUD_ACCESS_KEY_SECRET=GBubpmh****
export SECURITY_TOKEN=CAIS****
```

This way, the environment variables can work with aliyun-cli.

### Profile

List or delete the profile names.

```sh
$ acs-sso profile
┌───────────┬──────────────────┬─────────────────────────┬───────────┐
│ Profile   │ Access ID        │ Access Configuration ID │ Status    │
├───────────┼──────────────────┼─────────────────────────┼───────────┤
│ default * │ 182837359590**** │ ac-00v3wh59ifjdxd4u**** │ Available │
└───────────┴──────────────────┴─────────────────────────┴───────────┘
```

The profile name with asterisk(*) is the profile currently in use.

```sh
$ acs-sso profile --delete --profile default
Delete the profile 'default' successful.
```

You may check other profile options with `acs-sso help profile`.

## Work with Aliyun-cli

```sh
$ `acs-sso login --profile user1 --env`   # Add the Credentials to the environment variables
$ export ALIBABACLOUD_IGNORE_PROFILE=TRUE # Disable the local existing profiles to avoid conflicts
$ aliyun sts GetCallerIdentity            # Use the Credentials from the environment variables
{
  "AccountId": "182837359590****",
  "Arn": "acs:ram::182837359590****:assume***/aliyunreserved***/ye***@ye***.onmicrosoft.com",
  "IdentityType": "AssumedRoleUser",
  "PrincipalId": "36410118165466****:ye***@ye***.onmicrosoft.com",
  "RequestId": "8AAAC6D1-F749-5B15-B428-D6EEB2E8****",
  "RoleId": "36410118165466****"
}
```

## License

The [Apache License 2.0](/LICENSE)

Copyright (c) 2009-present, Alibaba Cloud All rights reserved.
