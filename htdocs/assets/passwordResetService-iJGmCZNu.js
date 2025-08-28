var t=(d,s,e)=>new Promise((a,c)=>{var l=r=>{try{o(e.next(r))}catch(i){c(i)}},u=r=>{try{o(e.throw(r))}catch(i){c(i)}},o=r=>r.done?a(r.value):Promise.resolve(r.value).then(l,u);o((e=e.apply(d,s)).next())});import{s as n}from"./index-ZwIgorfy.js";import{E as p}from"./emailService-CYvLt_Xb.js";class g{static sendPasswordResetEmail(s){return t(this,null,function*(){try{const{error:e}=yield n.auth.resetPasswordForEmail(s,{redirectTo:`${window.location.origin}/reset-password`});if(e)return console.error("Password reset error:",e),{success:!1,message:e.message||"Failed to send password reset email"};try{const a=`${window.location.origin}/reset-password`;yield p.sendCustomEmail({to:s,subject:"Reset Your Password - LSR Transport",html:`
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Reset Your Password - LSR Transport</title>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
                .security { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>Reset Your Password</h1>
                  <p>LSR Transport Account Security</p>
                </div>
                <div class="content">
                  <h2>Password Reset Request</h2>
                  
                  <p>We received a request to reset your password for your LSR Transport account. Click the button below to create a new password:</p>
                  
                  <div style="text-align: center;">
                    <a href="${a}" class="button">Reset Password</a>
                  </div>
                  
                  <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
                  <p style="word-break: break-all; color: #667eea;">${a}</p>
                  
                  <div class="security">
                    <h3>🔒 Security Information:</h3>
                    <ul>
                      <li>This link will expire in 24 hours</li>
                      <li>If you didn't request a password reset, you can safely ignore this email</li>
                      <li>Your password will only be changed if you click the link above</li>
                      <li>For additional security, consider enabling two-factor authentication</li>
                    </ul>
                  </div>
                  
                  <p>If you have any questions or need assistance, please contact our support team.</p>
                </div>
                <div class="footer">
                  <p>© 2024 LSR Transport. All rights reserved.</p>
                  <p>This email was sent to ${s}</p>
                </div>
              </div>
            </body>
            </html>
          `})}catch(a){console.error("Failed to send custom password reset email:",a)}return{success:!0,message:"Password reset email sent successfully. Please check your email."}}catch(e){return console.error("Password reset service error:",e),{success:!1,message:e.message||"Failed to send password reset email"}}})}static updatePassword(s){return t(this,null,function*(){try{const{error:e}=yield n.auth.updateUser({password:s});return e?(console.error("Password update error:",e),{success:!1,message:e.message||"Failed to update password"}):{success:!0,message:"Password updated successfully"}}catch(e){return console.error("Password update service error:",e),{success:!1,message:e.message||"Failed to update password"}}})}static checkPasswordResetSession(){return t(this,null,function*(){try{const{data:{session:s}}=yield n.auth.getSession();return!!s}catch(s){return console.error("Session check error:",s),!1}})}}export{g as P};
