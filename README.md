# Alibaba Cloud SSO CLI

[![NPM version][npm-image]][npm-url]
[![build status][travis-image]][travis-url]
[![codecov][cov-image]][cov-url]
[![David deps][david-image]][david-url]
[![npm download][download-image]][download-url]

[npm-image]: https://img.shields.io/npm/v/@alicloud/sso-cli.svg?style=flat-square
[npm-url]: https://npmjs.org/package/@alicloud/sso-cli
[travis-image]: https://img.shields.io/travis/aliyun/alibabacloud-sso-cli.svg?style=flat-square
[travis-url]: https://travis-ci.com/aliyun/alibabacloud-sso-cli
[cov-image]: https://codecov.io/gh/aliyun/alibabacloud-sso-cli/branch/master/graph/badge.svg
[cov-url]: https://codecov.io/gh/aliyun/alibabacloud-sso-cli
[david-image]: https://img.shields.io/david/aliyun/alibabacloud-sso-cli.svg?style=flat-square
[david-url]: https://david-dm.org/aliyun/alibabacloud-sso-cli
[download-image]: https://img.shields.io/npm/dm/@alicloud/sso-cli.svg?style=flat-square
[download-url]: https://npmjs.org/package/@alicloud/sso-cli

## Installation

```sh
$ npm i @alicloud/sso-cli -g
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

```

## Usage

### Configure

```sh
$ acs-sso configure
```

跟着提示输入即可。例如：

```sh
$ acs-sso configure
? please input 'signinUrl': https://signin-cn-hangzhou.alibabacloudsso.com/lzy/login
configuration done!
```

### Login

```sh
$ acs-sso login
```

#### 强制重新登录
登录后会自动缓存，所以提供了 `--force` 来提供强制重新登录：

```sh
$ acs-sso login --force
```

#### 支持切换 Profile

使用 `--profile` 来支持不同的 profile 名字：

```sh
$ acs-sso login --profile user1
```

未输入 `--profile` 的情况下，默认为上次成功登录的身份。

## 配合阿里云 CLI

```sh
$ aliyun configure --mode External --profile sso
Configuring profile 'sso' in 'External' authenticate mode...
Process Command [acs-sso login]: 
Default Region Id [cn-hangzhou]: 
Default Output Format [json]: json (Only support json)
Default Language [zh|en] en: 
Saving profile[sso] ...Done.

Configure Done!!!
..............888888888888888888888 ........=8888888888888888888D=..............
...........88888888888888888888888 ..........D8888888888888888888888I...........
.........,8888888888888ZI: ...........................=Z88D8888888888D..........
.........+88888888 ..........................................88888888D..........
.........+88888888 .......Welcome to use Alibaba Cloud.......O8888888D..........
.........+88888888 ............. ************* ..............O8888888D..........
.........+88888888 .... Command Line Interface(Reloaded) ....O8888888D..........
.........+88888888...........................................88888888D..........
..........D888888888888DO+. ..........................?ND888888888888D..........
...........O8888888888888888888888...........D8888888888888888888888=...........
............ .:D8888888888888888888.........78888888888888888888O ..............
```

注意点是 Process Command 的输入需要是 `acs-sso login`。

测试：

```sh
$ aliyun ecs DescribeRegions --profile sso
```

## License
The [Apache License 2.0](/LICENSE)

Copyright (c) 2009-present, Alibaba Cloud All rights reserved.
