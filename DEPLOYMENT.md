# 🚀 Deployment Guide

## Quick Deployment Steps

### Backend (AWS Elastic Beanstalk)

1. **Build JAR File**
   ```bash
   cd backend
   ./mvnw clean package -DskipTests
   ```

2. **Upload to AWS**
   - Go to [AWS Elastic Beanstalk Console](https://console.aws.amazon.com/elasticbeanstalk/)
   - Select environment: `skill-sync-backend-env`
   - Click "Upload and Deploy"
   - Upload: `target/backend-0.0.1-SNAPSHOT.jar`

3. **Set Environment Variables**
   ```
   SENTRY_AUTH_TOKEN=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
   SENTRY_DSN=https://f20a6e3e40ac9bb3429546045140d983@o4510241499578368.ingest.us.sentry.io/4510241501872128
   ```

### Frontend (Vercel)

1. **Set Environment Variable**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Select project: `skill-sync`
   - Settings → Environment Variables
   - Add: `NEXT_PUBLIC_SENTRY_DSN=https://ab529eed11960d843ce22f3acb250427@o4510241499578368.ingest.us.sentry.io/4510241530773504`

2. **Deploy**
   - Push to GitHub (auto-deploys)
   - Or manually redeploy from Vercel dashboard

### Testing

1. **Test Backend**
   ```bash
   curl http://skill-sync-backend-env.eba-ma6u2vbm.us-east-1.elasticbeanstalk.com/api/debug/test-error
   ```

2. **Test Frontend**
   - Visit your Vercel URL
   - Test user registration/login
   - Test flashcard creation
   - Test AI generation

3. **Check Sentry**
   - Go to [sentry.io](https://sentry.io)
   - Check for errors and performance data

## Environment Variables Summary

### Backend (AWS EB)
- `SENTRY_AUTH_TOKEN` - For source map uploads
- `SENTRY_DSN` - For error tracking
- `RDS_PASSWORD` - Database password
- `JWT_SECRET` - JWT signing key
- `OPENAI_API_KEY` - AI generation

### Frontend (Vercel)
- `NEXT_PUBLIC_SENTRY_DSN` - Client-side error tracking

## Monitoring

- **Sentry Dashboard**: Real-time error tracking
- **AWS CloudWatch**: Backend logs and metrics
- **Vercel Analytics**: Frontend performance

## Troubleshooting

### Common Issues
1. **403 Forbidden**: Check security configuration
2. **500 Errors**: Check environment variables
3. **CORS Issues**: Verify API base URL
4. **Sentry Not Working**: Check DSN configuration

### Debug Endpoints
- `/api/debug/db-test` - Database connection test
- `/api/debug/test-error` - Sentry error test
