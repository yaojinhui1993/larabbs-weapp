# LaraBBS - WeApp

## Environment

1. Install *WePY*
2. Add *TabBar*
3. Add *WeUI*

## User Login

1. WePY use promise function
2. Custom function in specified file
3. Login
4. Send request

## Phone Register

* The register flow
  1. User get verification code
      1. User fill captcha
      2. User Send the filled captcha code
      3. Server verify the code, and send SMS to the user
  2. User fill verification code and other form inputs
  3. User send form data
  4. Server register the user
* `showToast`
* `setStorageSync`
* `switchTab`
* `modal`

## User

* Add global method `checkLogin` and `getCurrentUser` in `app.wpy`, and use `this.$parent.getCurrentUser` invoke these methods.
* Use `wepy.uploadFile()` to send file to server
* Use `wepy.chooseImage` to select files.

## Topics

* Topic's index, show, delete pages and actions
* Pull down refresh
* Pull up load more
* Navigator open types
* Component
* Global data
