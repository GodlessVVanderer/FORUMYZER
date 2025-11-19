const axios = require('axios');

/**
 * AI-powered comment classifier using Google Gemini API
 * Provides intelligent categorization and spam detection
 */

const defaultCategories = ['spam', 'bot', 'toxic', 'genuine', 'question', 'feedback', 'discussion'];

/**
 * Classify comments using AI with batch processing for efficiency
 * @param {Array} comments Array of comment objects { id, author, text, replies }
 * @param {Object} options Classification options
 * @returns {Array} Comments with category and confidence fields
 */
async function classifyCommentsAI(comments, options = {}) {
  const apiKey = process.env.GEMINI_API_KEY;
  const useFallback = !apiKey || options.useFallback;

  if (useFallback) {
    console.log('Using fallback keyword-based classifier');
    return classifyCommentsFallback(comments);
  }

  try {
    // Process in batches to avoid token limits
    const batchSize = 20;
    const batches = [];
    for (let i = 0; i < comments.length; i += batchSize) {
      batches.push(comments.slice(i, i + batchSize));
    }

    const classifiedBatches = await Promise.all(
      batches.map(batch => classifyBatchWithGemini(batch, apiKey))
    );

    return classifiedBatches.flat();
  } catch (error) {
    console.error('AI classification failed, using fallback:', error.message);
    return classifyCommentsFallback(comments);
  }
}

/**
 * Classify a batch of comments using Gemini API
 */
async function classifyBatchWithGemini(comments, apiKey) {
  const prompt = buildClassificationPrompt(comments);

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  try {
    const response = await axios.post(url, {
      contents: [{
        parts: [{
          text: prompt
        }]
      }],
      generationConfig: {
        temperature: 0.2,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      }
    });

    const resultText = response.data.candidates[0].content.parts[0].text;
    return parseGeminiResponse(resultText, comments);
  } catch (error) {
    console.error('Gemini API error:', error.response?.data || error.message);
    return classifyCommentsFallback(comments);
  }
}

/**
 * Build classification prompt for Gemini
 */
function buildClassificationPrompt(comments) {
  const commentList = comments.map((c, idx) =>
    `${idx + 1}. Author: ${c.author}\n   Text: ${c.text}`
  ).join('\n\n');

  return `You are a YouTube comment analyzer. Classify each comment into ONE of these categories:
- spam: Promotional content, links, "check out my channel", scams
- bot: Automated messages, repetitive generic comments
- toxic: Hate speech, harassment, offensive language, personal attacks
- question: Questions about the video or topic
- feedback: Constructive criticism or suggestions
- discussion: Thoughtful discussion or analysis
- genuine: Positive reactions, appreciation, simple comments

For each comment, also detect if it should be REMOVED (spam, severe toxicity, or clear bot).

Comments to classify:
${commentList}

Respond ONLY with JSON array format (no markdown):
[
  {"index": 1, "category": "spam", "confidence": 0.95, "remove": true, "reason": "Contains promotional link"},
  {"index": 2, "category": "genuine", "confidence": 0.85, "remove": false, "reason": "Positive reaction"}
]`;
}

/**
 * Parse Gemini API response
 */
function parseGeminiResponse(resultText, comments) {
  try {
    // Remove markdown code blocks if present
    const cleanText = resultText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const classifications = JSON.parse(cleanText);

    return comments.map((comment, idx) => {
      const classification = classifications.find(c => c.index === idx + 1);
      if (!classification) {
        return { ...comment, category: 'genuine', confidence: 0.5, shouldRemove: false };
      }

      return {
        ...comment,
        category: classification.category,
        confidence: classification.confidence || 0.8,
        shouldRemove: classification.remove || false,
        classificationReason: classification.reason || ''
      };
    });
  } catch (error) {
    console.error('Failed to parse Gemini response:', error.message);
    return classifyCommentsFallback(comments);
  }
}

/**
 * Fallback keyword-based classifier (enhanced version)
 */
function classifyCommentsFallback(comments) {
  return comments.map(comment => {
    const text = comment.text.toLowerCase();
    let category = 'genuine';
    let shouldRemove = false;
    let confidence = 0.7;

    // Spam detection (enhanced)
    if (/http|www\.|\.com|\.net|t\.me|discord\.gg|subscribe|check.*(channel|out)|click.*link|free.*money|make.*\$|buy.*now/i.test(text)) {
      category = 'spam';
      shouldRemove = true;
      confidence = 0.85;
    }
    // Bot detection (enhanced)
    else if (/bot|automated|robot|i['']?m a bot|generated|auto.?reply/i.test(text) ||
             (text.length < 20 && /^(first|nice|cool|good|thanks)!*$/i.test(text.trim()))) {
      category = 'bot';
      shouldRemove = false;
      confidence = 0.75;
    }
    // Toxic detection (enhanced)
    else if (/\b(hate|kill|die|kys|stupid|idiot|racist|f[*u]ck|sh[*i]t|b[*i]tch|a[*s]shole|retard|cancer)\b/i.test(text)) {
      category = 'toxic';
      shouldRemove = true;
      confidence = 0.9;
    }
    // Question detection
    else if (/\?/.test(text) && text.length > 10) {
      category = 'question';
      confidence = 0.8;
    }
    // Feedback detection
    else if (/suggest|recommend|improve|better|should|could|feedback|critique/i.test(text) && text.length > 30) {
      category = 'feedback';
      confidence = 0.75;
    }
    // Discussion detection
    else if (text.length > 100 && /because|however|therefore|interesting|analysis|perspective/i.test(text)) {
      category = 'discussion';
      confidence = 0.8;
    }

    return {
      ...comment,
      category,
      confidence,
      shouldRemove,
      classificationReason: 'Keyword-based classification'
    };
  });
}

/**
 * Filter out comments marked for removal
 */
function removeSpam(comments) {
  return comments.filter(comment => !comment.shouldRemove);
}

module.exports = {
  classifyCommentsAI,
  removeSpam,
  defaultCategories
};
