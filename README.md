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

> Requires node v7.6.0 or higher for ES2015 and async function support. The latest stable Node.js
> is recommended.

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

跟着提示输入即可。例如：

```sh
$ acs-sso configure
? please input 'signinUrl': https://signin-******.alibabacloudsso.com/***/login
configuration done!
```

上面的 signinUrl 可以在云 SSO 控制台首页上获取，每个目录的链接各不相同。

### Login

```sh
acs-sso login
```

如果你的身份下，有多个账号或多个访问配置，将会提示您选择账号和配置。登录成功后，profile 会绑定这份账号和配置。

下次登录将会使用登录成功后的缓存 STS 信息。

#### 强制重新登录

登录后会自动缓存 STS 信息，所以提供了 `--force` 来提供强制刷新 STS 信息：

```sh
acs-sso login --force
```

#### 支持切换 Profile

默认情况下，使用的 profile 为 default。您可以使用 `--profile` 来支持不同的 profile 名字：

```sh
acs-sso login --profile user1
```

未输入 `--profile` 的情况下，默认为上次成功登录的身份。

#### 输出控制

默认情况，输出的结果为一个 JSON 格式的数据：

```sh
{
  "mode": "StsToken",
  "access_key_id": "STS.NUyPeEoab****",
  "access_key_secret": "GBubpmh****",
  "sts_token": "CAIS****"
}
```

您可以使用 `--env` 这个 flag 来控制输出为环境变量的模式：

```sh
export ALIBABACLOUD_ACCESS_KEY_ID=STS.NUyPeEoab****
export ALIBABACLOUD_ACCESS_KEY_SECRET=GBubpmh****
export SECURITY_TOKEN=CAIS****
```

上述环境变量可以与阿里云的相关工具进行配合。

### Profile

用于查看或删除已配置的 profile。

```sh
$ acs-sso profile
┌───────────┬──────────────────┬─────────────────────────┬───────────┐
│ Profile   │ Access ID        │ Access Configuration ID │ Status    │
├───────────┼──────────────────┼─────────────────────────┼───────────┤
│ default * │ 182837359590**** │ ac-00v3wh59ifjdxd4u**** │ Available │
└───────────┴──────────────────┴─────────────────────────┴───────────┘
```

第一列展示的是 profile 名称，带星号，表明为当前默认的 profile。

```sh
$ acs-sso profile --delete --profile default
Delete the profile 'default' successful.
```

你可以通过 `acs-sso help profile` 查看完整的操作及选项。

## 配合阿里云 CLI

```sh
$ `acs-sso login --profile user1 --env`   # 将 Credentials 信息设置进环境变量
$ export ALIBABACLOUD_IGNORE_PROFILE=TRUE # 如果本地配置过 aliyun，通过此环境变量禁用配置，避免干扰
$ aliyun sts GetCallerIdentity            # 直接使用环境变量中的 Credentials 信息
```

## License

The [Apache License 2.0](/LICENSE)

Copyright (c) 2009-present, Alibaba Cloud All rights reserved.
