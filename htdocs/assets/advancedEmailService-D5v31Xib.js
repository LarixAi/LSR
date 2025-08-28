var m=Object.defineProperty;var h=(s,e,t)=>e in s?m(s,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):s[e]=t;var p=(s,e,t)=>h(s,typeof e!="symbol"?e+"":e,t);var r=(s,e,t)=>new Promise((i,n)=>{var o=a=>{try{c(t.next(a))}catch(l){n(l)}},u=a=>{try{c(t.throw(a))}catch(l){n(l)}},c=a=>a.done?i(a.value):Promise.resolve(a.value).then(o,u);c((t=t.apply(s,e)).next())});import{s as g}from"./index-ZwIgorfy.js";function d(s){return r(this,null,function*(){try{const{data:e,error:t}=yield g.functions.invoke("send-general-email",{body:{emailData:s}});return t?(console.error("Advanced Email Service - Edge function error:",t),{success:!1,error:t.message}):e&&e.success?(console.log("Advanced Email Service - Email sent successfully via edge function:",e.id),{success:!0,id:e.id}):(console.error("Advanced Email Service - Email sending failed:",(e==null?void 0:e.error)||"Unknown error"),{success:!1,error:(e==null?void 0:e.error)||"Unknown error"})}catch(e){return console.error("Advanced Email Service - Failed to invoke edge function:",e),{success:!1,error:e.message}}})}class f{static sendEmail(e){return r(this,null,function*(){try{return yield d({from:e.from||this.defaultFrom,to:e.to,subject:e.subject,html:e.html,text:e.text,replyTo:e.replyTo,cc:e.cc,bcc:e.bcc,attachments:e.attachments})}catch(t){return{success:!1,error:t.message}}})}static sendBatchEmails(e){return r(this,null,function*(){try{const t=[],i=[];for(const n of e.emails){const o=yield d(n);o.success?t.push(o):i.push({error:o.error})}return{success:i.length===0,results:t,errors:i}}catch(t){return{success:!1,results:[],errors:[{error:t.message}]}}})}static getEmail(e){return r(this,null,function*(){return{success:!1,error:"Email retrieval not implemented via edge function"}})}static updateEmail(e){return r(this,null,function*(){return{success:!1,error:"Email updates not implemented via edge function"}})}static cancelEmail(e){return r(this,null,function*(){return{success:!1,error:"Email cancellation not implemented via edge function"}})}static scheduleEmail(e,t){return r(this,null,function*(){try{return yield d({from:e.from||this.defaultFrom,to:e.to,subject:e.subject,html:e.html,text:e.text,replyTo:e.replyTo,cc:e.cc,bcc:e.bcc,attachments:e.attachments,scheduledAt:t})}catch(i){return{success:!1,error:i.message}}})}static sendAdvancedAgreementNotification(e){return r(this,null,function*(){const t=`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Important: Updated ${e.agreementTitle}</title>
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
            <h1>Important: Updated ${e.agreementTitle}</h1>
            <p>Action Required - Please Review and Accept</p>
          </div>
          <div class="content">
            <h2>Hi ${e.firstName},</h2>
            
            <div class="alert">
              <strong>⚠️ Action Required:</strong> We have updated our ${e.agreementType} and need you to review and accept the new terms to continue using our services.
            </div>
            
            <p>To ensure uninterrupted access to your LSR Transport account, please log in and review the updated ${e.agreementTitle}.</p>
            
            <div style="text-align: center;">
              <a href="${e.loginUrl}" class="button">Review Updated Agreement</a>
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
            <p>This email was sent to ${e.to.join(", ")}</p>
          </div>
        </div>
      </body>
      </html>
    `;return this.sendEmail({from:this.defaultFrom,to:e.to,subject:`Important: Updated ${e.agreementTitle} - Action Required`,html:t})})}static sendBulkAgreementNotifications(e,t){return r(this,null,function*(){const i=e.map(n=>({from:this.defaultFrom,to:[n.email],subject:`Important: Updated ${t.title} - Action Required`,html:`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Updated ${t.title}</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #ff6b6b; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Updated ${t.title}</h1>
              <p>Action Required</p>
            </div>
            <div class="content">
              <h2>Hi ${n.firstName},</h2>
              <p>We have updated our ${t.type}. Please review and accept the new terms.</p>
              <div style="text-align: center;">
                <a href="${t.loginUrl}" class="button">Review Agreement</a>
              </div>
            </div>
            <div class="footer">
              <p>© 2024 LSR Transport. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `}));return this.sendBatchEmails({emails:i})})}static getEmailStatus(e){return r(this,null,function*(){return{success:!1,error:"Email status retrieval not implemented via edge function"}})}static rescheduleEmail(e,t){return r(this,null,function*(){return this.updateEmail({id:e,scheduledAt:t})})}static sendTestEmail(e,t){return r(this,null,function*(){const i=t||`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Test Email - LSR Transport</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Test Email</h1>
            <p>LSR Transport Email System</p>
          </div>
          <div class="content">
            <h2>Hello!</h2>
            <p>This is a test email from the LSR Transport email system.</p>
            <p>If you're receiving this email, it means our email system is working correctly!</p>
            <p><strong>Test Details:</strong></p>
            <ul>
              <li>Sent via Resend API</li>
              <li>Timestamp: ${new Date().toLocaleString()}</li>
              <li>Recipient: ${e}</li>
            </ul>
          </div>
          <div class="footer">
            <p>© 2024 LSR Transport. All rights reserved.</p>
            <p>This is a test email sent to ${e}</p>
          </div>
        </div>
      </body>
      </html>
    `;return this.sendEmail({from:this.defaultFrom,to:[e],subject:"Test Email - LSR Transport Email System",html:i})})}}p(f,"defaultFrom","LSR Transport <noreply@transport.logisticssolutionresources.com>");export{f as A};
