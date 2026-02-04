export const secularQuotes = [
    "The secret of getting ahead is getting started.",
    "Don't watch the clock; do what it does. Keep going.",
    "Small steps every day add up to big results.",
    "Your direction is more important than your speed.",
    "Breath. Let go. And remind yourself that this very moment is the only one you know you have for sure.",
    "Act as if what you do makes a difference. It does.",
    "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    "Believe you can and you're halfway there.",
    "You are never too old to set another goal or to dream a new dream.",
    "It does not matter how slowly you go as long as you do not stop.",
    "Everything you've ever wanted is on the other side of fear.",
    "Hardships often prepare ordinary people for an extraordinary destiny.",
    "The only way to do great work is to love what you do.",
    "Start where you are. Use what you have. Do what you can.",
    "Dream big and dare to fail."
];

export const faithQuotes = [
    "For I know the plans I have for you, declares the Lord. (Jeremiah 29:11)",
    "I can do all this through him who gives me strength. (Philippians 4:13)",
    "Be strong and courageous. Do not be afraid; do not be discouraged. (Joshua 1:9)",
    "Cast all your anxiety on him because he cares for you. (1 Peter 5:7)",
    "The fruit of the Spirit is love, joy, peace, patience, kindness, goodness, faithfulness. (Galatians 5:22)",
    "Trust in the LORD with all your heart and lean not on your own understanding. (Proverbs 3:5)",
    "But those who hope in the LORD will renew their strength. (Isaiah 40:31)",
    "The LORD is my shepherd, I lack nothing. (Psalm 23:1)",
    "Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God. (Philippians 4:6)",
    "Come to me, all you who are weary and burdened, and I will give you rest. (Matthew 11:28)",
    "We walk by faith, not by sight. (2 Corinthians 5:7)",
    "Let all that you do be done in love. (1 Corinthians 16:14)",
    "Be still, and know that I am God. (Psalm 46:10)",
    "This is the day that the LORD has made; let us rejoice and be glad in it. (Psalm 118:24)",
    "And we know that in all things God works for the good of those who love him. (Romans 8:28)"
];

export function getDailyQuote(faithMode) {
    const list = faithMode ? [...secularQuotes, ...faithQuotes] : secularQuotes;
    // Simple "random" based on day of year to preserve it for the day
    const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
    return list[dayOfYear % list.length];
}
