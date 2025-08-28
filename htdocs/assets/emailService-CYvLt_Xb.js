var m=Object.defineProperty;var g=(o,t,e)=>t in o?m(o,t,{enumerable:!0,configurable:!0,writable:!0,value:e}):o[t]=e;var u=(o,t,e)=>g(o,typeof t!="symbol"?t+"":t,e);var l=(o,t,e)=>new Promise((n,r)=>{var s=i=>{try{d(e.next(i))}catch(c){r(c)}},a=i=>{try{d(e.throw(i))}catch(c){r(c)}},d=i=>i.done?n(i.value):Promise.resolve(i.value).then(s,a);d((e=e.apply(o,t)).next())});import{s as h}from"./index-ZwIgorfy.js";function p(o){return l(this,null,function*(){try{const{data:t,error:e}=yield h.functions.invoke("send-general-email",{body:{emailData:o}});return e?(console.error("Edge function error:",e),!1):t&&t.success?(console.log("Email sent successfully via edge function:",t.id),!0):(console.error("Email sending failed:",(t==null?void 0:t.error)||"Unknown error"),!1)}catch(t){return console.error("Failed to invoke edge function:",t),!1}})}class f{static isConfigured(){return l(this,null,function*(){return typeof window!="undefined"&&!!h})}static getSenderEmail(t,e){return t&&e==="user"?`LSR Transport <${t}>`:this.defaultFrom}static sendVerificationEmail(t){return l(this,null,function*(){try{const{to:e,firstName:n,verificationUrl:r}=t,s=`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verify Your Email - LSR Transport</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to LSR Transport!</h1>
              <p>Please verify your email address to get started</p>
            </div>
            <div class="content">
              <h2>Hi ${n},</h2>
              <p>Thank you for signing up with LSR Transport Management System. To complete your registration and access your account, please verify your email address by clicking the button below:</p>
              
              <div style="text-align: center;">
                <a href="${r}" class="button">Verify Email Address</a>
              </div>
              
              <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #667eea;">${r}</p>
              
              <p>This link will expire in 24 hours for security reasons.</p>
              
              <p>If you didn't create an account with LSR Transport, you can safely ignore this email.</p>
            </div>
            <div class="footer">
              <p>© 2024 LSR Transport. All rights reserved.</p>
              <p>This email was sent to ${e}</p>
            </div>
          </div>
        </body>
        </html>
      `;return yield p({from:this.defaultFrom,to:[e],subject:"Verify Your Email - LSR Transport",html:s})}catch(e){return console.error("Failed to send verification email:",e),!1}})}static sendAgreementNotification(t){return l(this,null,function*(){try{const{to:e,firstName:n,lastName:r,email:s,agreementTitle:a,agreementType:d,loginUrl:i}=t,c=`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Updated ${a} - Action Required</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #ff6b6b; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
            .alert { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Important: Updated ${a}</h1>
              <p>Action Required - Please Review and Accept</p>
            </div>
            <div class="content">
              <h2>Hi ${n}${r?` ${r}`:""},</h2>
              
              <div class="alert">
                <strong>⚠️ Action Required:</strong> We have updated our ${d} and need you to review and accept the new terms to continue using our services.
              </div>
              
              <p>To ensure uninterrupted access to your LSR Transport account, please log in and review the updated ${a}.</p>
              
              <div style="text-align: center;">
                <a href="${i}" class="button">Review Updated Agreement</a>
              </div>
              
              <h3>What's Changed?</h3>
              <ul>
                <li>Updated privacy practices and data protection measures</li>
                <li>Enhanced security protocols</li>
                <li>Improved user rights and transparency</li>
                <li>Compliance with latest regulations</li>
              </ul>
              
              <p><strong>Please note:</strong> You won't be able to access your account until you accept the updated agreement.</p>
              
              <p>If you have any questions about these changes, please don't hesitate to contact our support team.</p>
            </div>
            <div class="footer">
              <p>© 2024 LSR Transport. All rights reserved.</p>
              <p>This email was sent to ${e}</p>
            </div>
          </div>
        </body>
        </html>
      `;return yield p({from:this.getSenderEmail(s,"user"),to:[e],subject:`Important: Updated ${a} - Action Required`,html:c})}catch(e){return console.error("Failed to send agreement notification:",e),!1}})}static sendWelcomeEmail(t){return l(this,null,function*(){try{const{to:e,firstName:n,lastName:r,email:s,loginUrl:a}=t,d=`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to LSR Transport!</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #00b894 0%, #00a085 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #00b894; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
            .features { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 30px 0; }
            .feature { background: white; padding: 20px; border-radius: 5px; text-align: center; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to LSR Transport!</h1>
              <p>Your account is ready to use</p>
            </div>
            <div class="content">
              <h2>Hi ${n}${r?` ${r}`:""},</h2>
              
              <p>Welcome to LSR Transport Management System! Your account has been successfully created and you're ready to start managing your transportation operations.</p>
              
              <p><strong>Account Details:</strong></p>
              <ul>
                <li><strong>Email:</strong> ${s}</li>
                <li><strong>Name:</strong> ${n}${r?` ${r}`:""}</li>
                <li><strong>Account Status:</strong> Active</li>
              </ul>
              
              <div style="text-align: center;">
                <a href="${a}" class="button">Access Your Dashboard</a>
              </div>
              
              <h3>What you can do with LSR Transport:</h3>
              <div class="features">
                <div class="feature">
                  <h4>🚛 Vehicle Management</h4>
                  <p>Track and manage your fleet efficiently</p>
                </div>
                <div class="feature">
                  <h4>👥 Driver Management</h4>
                  <p>Manage driver profiles and documentation</p>
                </div>
                <div class="feature">
                  <h4>📊 Analytics & Reports</h4>
                  <p>Get insights into your operations</p>
                </div>
                <div class="feature">
                  <h4>🔔 Smart Notifications</h4>
                  <p>Stay updated with real-time alerts</p>
                </div>
              </div>
              
              <p><strong>Next Steps:</strong></p>
              <ol>
                <li>Log in to your account</li>
                <li>Complete your profile setup</li>
                <li>Add your vehicles and drivers</li>
                <li>Start managing your operations</li>
              </ol>
              
              <p>If you have any questions or need assistance, our support team is here to help!</p>
            </div>
            <div class="footer">
              <p>© 2024 LSR Transport. All rights reserved.</p>
              <p>This email was sent to ${e}</p>
            </div>
          </div>
        </body>
        </html>
      `;return yield p({from:this.getSenderEmail(s,"user"),to:[e],subject:"Welcome to LSR Transport - Your Account is Ready!",html:d})}catch(e){return console.error("Failed to send welcome email:",e),!1}})}static sendReminderEmail(t){return l(this,null,function*(){try{const{to:e,firstName:n,lastName:r,email:s,agreementTitle:a,agreementType:d,loginUrl:i}=t,c=`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reminder: Please Accept Updated Agreement</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #fdcb6e 0%, #e17055 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #fdcb6e; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Friendly Reminder</h1>
              <p>Please Accept Updated Agreement</p>
            </div>
            <div class="content">
              <h2>Hi ${n}${r?` ${r}`:""},</h2>
              
              <p>This is a friendly reminder that you have a pending ${d} update that needs your attention.</p>
              
              <p>To ensure uninterrupted access to your LSR Transport account, please log in and accept the updated ${a}.</p>
              
              <div style="text-align: center;">
                <a href="${i}" class="button">Accept Updated Agreement</a>
              </div>
              
              <p>This should only take a few minutes of your time.</p>
              
              <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
            </div>
            <div class="footer">
              <p>© 2024 LSR Transport. All rights reserved.</p>
              <p>This email was sent to ${e}</p>
            </div>
          </div>
        </body>
        </html>
      `;return yield p({from:this.getSenderEmail(s,"user"),to:[e],subject:`Reminder: Please Accept Updated ${a}`,html:c})}catch(e){return console.error("Failed to send reminder email:",e),!1}})}static sendCustomEmail(t){return l(this,null,function*(){try{return yield p({from:t.from||this.defaultFrom,to:[t.to],subject:t.subject,html:t.html})}catch(e){return console.error("Failed to send custom email:",e),!1}})}}u(f,"defaultFrom","LSR Transport <noreply@transport.logisticssolutionresources.com>");export{f as E};
