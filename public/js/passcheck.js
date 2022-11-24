function passcheck(){
var regPassword = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,16}$/;
var password = $("#password").val();
    if (password == "") {
      $("#passwordError").text("**Password is required");
      return false;
    } else if (!regPassword.test(password)) {
      $("#passwordError").text(
        "**Password must be include letters, special characters and digits"
      );
      return false;
    } else {
      $("#passwordError").text("");
    }

    var cpassword = $("#cpassword").val();
    if (cpassword == "") {
      $("#cpasswordError").text("**Confirm Password is required");
      return false;
    } else if (!regPassword.test(cpassword)) {
      $("#cpasswordError").text(
        "**Password must be include letters, special characters and digits"
      );
      return false;
    } else {
      $("#cpasswordError").text("");
    }
}