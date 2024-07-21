export function changeOverflow() {
    let body = document.querySelector('body');
    let style = window.getComputedStyle(body);

    if (style.overflow === 'hidden') {
        document.querySelector('body').style.overflow = 'auto';
    }
}